"use client";

import { ArrowUpRight, CalendarDays, Clock, ExternalLink, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCalendarEvents, type CalendarEvent } from "@/lib/calendar";
import { SITE } from "@/lib/site";

type GroupedEvent = {
  summary: string;
  location: string;
  timeLabel: string;
  htmlLink?: string;
  isYec: boolean;
};

type EventGroup = {
  key: string;
  weekday: string;
  day: string;
  month: string;
  events: GroupedEvent[];
};

type CalendarState = {
  status: "loading" | "ready" | "error";
  groups: EventGroup[];
};

function groupEventsByDay(events: CalendarEvent[]): EventGroup[] {
  const timeZone = "America/Vancouver";
  const formatter = (zone: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: zone, ...options });
  const time = formatter(timeZone, { hour: "numeric", minute: "2-digit" });
  const groups: EventGroup[] = [];
  const byKey = new Map<string, EventGroup>();

  for (const event of events) {
    const isAllDay = Boolean(event.start?.date) && !event.start?.dateTime;
    const startRaw = event.start?.dateTime ?? event.start?.date;
    if (!startRaw) continue;
    if (isAllDay && !/^\d{4}-\d{2}-\d{2}$/.test(startRaw)) continue;
    const start = isAllDay ? new Date(`${startRaw}T12:00:00.000Z`) : new Date(startRaw);
    if (Number.isNaN(start.getTime())) continue;
    const displayZone = isAllDay ? "UTC" : timeZone;
    const keyParts = formatter(displayZone, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(start);
    const values = Object.fromEntries(keyParts.map((part) => [part.type, part.value]));
    const key = `${values.year}-${values.month}-${values.day}`;
    let group = byKey.get(key);
    if (!group) {
      group = {
        key,
        weekday: formatter(displayZone, { weekday: "short" }).format(start),
        day: formatter(displayZone, { day: "numeric" }).format(start),
        month: formatter(displayZone, { month: "short" }).format(start),
        events: [],
      };
      byKey.set(key, group);
      groups.push(group);
    }
    const end = !isAllDay && event.end?.dateTime ? new Date(event.end.dateTime) : null;
    const timeLabel = isAllDay
      ? "All day"
      : end && !Number.isNaN(end.getTime())
        ? `${time.format(start)} – ${time.format(end)}`
        : time.format(start);
    const location = event.location ?? "";
    group.events.push({
      summary: event.summary ?? "Community event",
      location,
      timeLabel,
      htmlLink: event.htmlLink,
      isYec: /yec|youth/i.test(location),
    });
  }

  return groups;
}

export function CommunityCalendar() {
  const [calendar, setCalendar] = useState<CalendarState>({ status: "loading", groups: [] });

  useEffect(() => {
    const controller = new AbortController();
    fetchCalendarEvents(controller.signal)
      .then((events) => setCalendar({ status: "ready", groups: groupEventsByDay(events) }))
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Unable to load the GICC calendar", error);
        setCalendar({ status: "error", groups: [] });
      });
    return () => controller.abort();
  }, []);

  return (
    <section id="calendar" className="calendar-section" aria-labelledby="calendar-heading">
      <div className="shell calendar-content">
        <div className="calendar-heading-row">
          <a className="button button--gold" href={SITE.calendarUrl} target="_blank" rel="noreferrer">
            <ArrowUpRight aria-hidden="true" /> Open Full Calendar
          </a>
        </div>

        <div className="calendar-card" aria-live="polite" aria-busy={calendar.status === "loading"}>
          {calendar.status === "loading"
            ? [0, 1, 2].map((row) => (
                <div className="calendar-day-row calendar-day-row--skeleton" key={row} aria-hidden="true">
                  <div className="calendar-date-chip"><span className="calendar-skeleton calendar-skeleton--date" /></div>
                  <div className="calendar-day-events">
                    <span className="calendar-skeleton calendar-skeleton--title" />
                    <span className="calendar-skeleton calendar-skeleton--meta" />
                  </div>
                </div>
              ))
            : null}

          {calendar.status !== "loading" && calendar.groups.length === 0 ? (
            <div className="calendar-empty">
              <CalendarDays aria-hidden="true" />
              <h3>{calendar.status === "error" ? "Couldn't load events right now" : "No upcoming events"}</h3>
              <p>See the full schedule and add it to your own calendar.</p>
              <a className="button button--light" href={SITE.calendarUrl} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden="true" /> Open Full Calendar
              </a>
            </div>
          ) : null}

          {calendar.groups.map((group) => (
            <div className="calendar-day-row" key={group.key}>
              <time className="calendar-date-chip" dateTime={group.key}>
                <span>{group.weekday}</span><strong>{group.day}</strong><small>{group.month}</small>
              </time>
              <div className="calendar-day-events">
                {group.events.map((event, index) => (
                  <a
                    className="calendar-event"
                    href={event.htmlLink ?? SITE.calendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    key={`${event.summary}-${event.timeLabel}-${index}`}
                  >
                    <div className="calendar-event__main">
                      <h3>{event.summary}</h3>
                      <p><Clock aria-hidden="true" /> {event.timeLabel}</p>
                    </div>
                    {event.location ? (
                      <span className={`calendar-location${event.isYec ? " calendar-location--yec" : " calendar-location--masjid"}`}>
                        <MapPin aria-hidden="true" /> {event.location}
                      </span>
                    ) : null}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
