export type PrayerTimesRecord = {
  prayer_date: string;
  fajr_azan: string | null;
  sunrise: string | null;
  dhuhr_azan: string | null;
  asr_azan: string | null;
  maghrib_azan: string | null;
  isha_azan: string | null;
  fajr_iqamah: string | null;
  dhuhr_iqamah: string | null;
  asr_iqamah: string | null;
  maghrib_iqamah: string | null;
  isha_iqamah: string | null;
  jumah_time_1: string | null;
  jumah_time_2: string | null;
  jumah_time_3: string | null;
};

export type PrayerStatus = "loading" | "ready" | "empty" | "error" | "unconfigured";

// BC permanent Pacific Time is UTC-7 from March 8, 2026, with no November fall-back.
// https://news.gov.bc.ca/releases/2026AG0013-000209
// Awqat wall times are BC local. Etc/GMT+7 means UTC-7 (the Etc sign is inverted).
function bcTimeZone(date: Date) {
  return date.getTime() >= Date.parse("2026-03-08T10:00:00Z")
    ? "Etc/GMT+7"
    : "America/Vancouver";
}

export function bcDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: bcTimeZone(date),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function bcLongDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: bcTimeZone(date),
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function hijriDateParts(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      timeZone: bcTimeZone(date),
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(date);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value;
    const day = get("day");
    const month = get("month");
    const year = get("year");
    return day && month && year ? { label: `${day} ${month} ${year}`, era: "AH" } : null;
  } catch {
    return null;
  }
}

function parsePrayerTime(value: string | null | undefined) {
  const match = String(value ?? "").match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

// Awqat has no Zawal field: per the masjid, use 10 minutes before Dhuhr start.
// Sunrise is supplied separately by the Awqat `sunrise` field.
export function zawalTime(dhuhrAzan: string | null | undefined): string | null {
  const match = (dhuhrAzan ?? "").trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59 || (match[3] !== undefined && Number(match[3]) > 59)) return null;
  const total = (hours * 60 + minutes - 10 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
export type PrayerCardRow =
  | { kind: "spacer" }
  | { kind: "time"; label: string; time: string | null | undefined; highlight?: boolean };

const PRAYER_FIELDS: Record<PrayerName, "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"> = {
  Fajr: "fajr",
  Dhuhr: "dhuhr",
  Asr: "asr",
  Maghrib: "maghrib",
  Isha: "isha",
};

// Card rows in time order. Zawal sits above Dhuhr Start (masjid request, Nov 9 2026);
// every other card gets a spacer in that slot so Start/Iqama rows stay level.
// Sunrise (Awqat `sunrise`) stays below Fajr Iqama.
export function prayerCardRows(name: PrayerName, record: Partial<PrayerTimesRecord> | null | undefined): PrayerCardRow[] {
  const key = PRAYER_FIELDS[name];
  const start = record?.[`${key}_azan`];
  const iqama = record?.[`${key}_iqamah`];
  const rows: PrayerCardRow[] = [
    name === "Dhuhr" ? { kind: "time", label: "Zawal", time: zawalTime(start) } : { kind: "spacer" },
    { kind: "time", label: "Start", time: start },
    { kind: "time", label: "Iqama", time: iqama, highlight: true },
  ];
  if (name === "Fajr") rows.push({ kind: "time", label: "Sunrise", time: record?.sunrise });
  return rows;
}

export function formatPrayerTime(value: string | null | undefined) {
  const parsed = parsePrayerTime(value);
  if (!parsed) return "-";
  const period = parsed.hours >= 12 ? "PM" : "AM";
  const hour = parsed.hours % 12 || 12;
  return `${hour}:${String(parsed.minutes).padStart(2, "0")} ${period}`;
}

function prayerMinutes(value: string | null | undefined) {
  const parsed = parsePrayerTime(value);
  return parsed ? parsed.hours * 60 + parsed.minutes : null;
}

export function currentBcMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: bcTimeZone(date),
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Number(values.hour) * 60 + Number(values.minute);
}

export function nextIqama(prayerTimes: PrayerTimesRecord | null, status: PrayerStatus, date = new Date()) {
  if (status === "loading") return "Loading...";
  if (!prayerTimes) return "Awqat";
  const prayers = [
    { name: "Fajr", time: prayerTimes.fajr_iqamah },
    { name: "Dhuhr", time: prayerTimes.dhuhr_iqamah },
    { name: "Asr", time: prayerTimes.asr_iqamah },
    { name: "Maghrib", time: prayerTimes.maghrib_iqamah },
    { name: "Isha", time: prayerTimes.isha_iqamah },
  ].filter((prayer) => prayerMinutes(prayer.time) !== null);
  const current = currentBcMinutes(date);
  const next = prayers.find((prayer) => (prayerMinutes(prayer.time) ?? -1) >= current) ?? prayers[0];
  return next ? `${next.name} ${formatPrayerTime(next.time)}` : "Awqat";
}

