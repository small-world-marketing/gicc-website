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

export async function fetchEvents(signal: AbortSignal) {
  const response = await fetch("/api/events", { signal });

  if (!response.ok) {
    throw new Error(`Events request failed with status ${response.status}`);
  }

  return validPayload(await response.json());
}
