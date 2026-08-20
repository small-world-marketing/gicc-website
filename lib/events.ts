export type SheetEvent = {
  name: string;
  category: string;
  audience: string;
  ageRange: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  days: string;
  recurrence: string;
  location: string;
  price: string;
  posterLink?: string;
  registrationLink?: string;
};

export type DerivedEvent = SheetEvent & {
  isRecurring: boolean;
  recurrenceLabel: string;
  startValue: number;
  hasStarted: boolean;
  endValue: number;
  isPast: boolean;
};

function validPayload(payload: unknown): SheetEvent[] {
  if (!payload || typeof payload !== "object" || !("events" in payload)) {
    throw new Error("Events response was not valid");
  }

  const events = (payload as { events?: unknown }).events;
  if (!Array.isArray(events)) throw new Error("Events list was not valid");

  return events.filter(
    (event): event is SheetEvent =>
      Boolean(event && typeof event === "object" && typeof (event as SheetEvent).name === "string"),
  );
}

// Matches the API route's Cache-Control max-age, so every consumer on the page shares one
// in-flight request and one resolved result instead of each issuing its own /api/events call.
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedEvents: { promise: Promise<SheetEvent[]>; expiresAt: number } | null = null;

export function fetchEvents(): Promise<SheetEvent[]> {
  const now = Date.now();
  if (!cachedEvents || cachedEvents.expiresAt < now) {
    const promise = fetch("/api/events")
      .then(async (response) => {
        if (!response.ok) throw new Error(`Events request failed with status ${response.status}`);
        return validPayload(await response.json());
      })
      .catch((error) => {
        cachedEvents = null;
        throw error;
      });
    cachedEvents = { promise, expiresAt: now + CACHE_TTL_MS };
  }
  return cachedEvents.promise;
}

const TODAY_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Vancouver",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function deriveEvents(events: SheetEvent[]): DerivedEvent[] {
  const todayKey = TODAY_KEY_FORMATTER.format(new Date());
  const todayValue = Date.parse(`${todayKey}T00:00:00.000Z`);

  return events
    .map((event) => {
      const startValue = Date.parse(`${event.startDate}T00:00:00.000Z`);
      if (Number.isNaN(startValue)) return null;
      const recurrenceText = event.recurrence.trim().toLowerCase();
      const isRecurring = recurrenceText !== "" && recurrenceText !== "one-time";
      const endValue = event.endDate
        ? Date.parse(`${event.endDate}T00:00:00.000Z`)
        : isRecurring
          ? Number.POSITIVE_INFINITY
          : startValue;
      if (Number.isNaN(endValue)) return null;
      return {
        ...event,
        isRecurring,
        recurrenceLabel: event.recurrence || (isRecurring ? "Recurring" : "One-time"),
        startValue,
        hasStarted: startValue <= todayValue,
        endValue,
        isPast: endValue < todayValue,
      };
    })
    .filter((event): event is DerivedEvent => event !== null)
    .sort((a, b) => {
      if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
      if (a.isPast) return b.endValue - a.endValue || a.name.localeCompare(b.name);
      if (a.hasStarted !== b.hasStarted) return a.hasStarted ? 1 : -1;
      if (a.hasStarted) return b.startValue - a.startValue || a.name.localeCompare(b.name);
      return a.startValue - b.startValue || a.name.localeCompare(b.name);
    });
}

export function normalizeSafeHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const hasScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function isPhoneNumber(value: string): boolean {
  return /^\+?[\d\s().-]{7,}$/.test(value.trim());
}

export function telHref(value: string): string {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

function driveFileId(url: string): string | null {
  const pathMatch = url.match(/\/file\/d\/([^/]+)/);
  if (pathMatch) return pathMatch[1];
  const queryMatch = url.match(/[?&]id=([^&]+)/);
  return queryMatch ? queryMatch[1] : null;
}

export function posterProxySrc(normalizedPosterLink: string): string | null {
  const fileId = driveFileId(normalizedPosterLink);
  return fileId ? `/api/poster?id=${encodeURIComponent(fileId)}` : null;
}

export function posterImageSrc(posterLink?: string): string | null {
  if (!posterLink) return null;
  const safeLink = normalizeSafeHttpUrl(posterLink);
  return safeLink ? posterProxySrc(safeLink) : null;
}
