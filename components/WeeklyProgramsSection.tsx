"use client";

import {
  ArrowDown,
  BookMarked,
  BookOpenCheck,
  CalendarDays,
  Clock,
  GraduationCap,
  MoonStar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCalendarEvents, type CalendarEvent } from "@/lib/calendar";

const PROGRAMS = [
  {
    title: "Ibn Mas'ood Madrasah",
    description:
      "Weekend Islamic education with Quran, Arabic, and foundational studies for young students.",
    matches: (summary: string) => summary === "ibn mas'ood madrasah",
    icon: GraduationCap,
  },
  {
    title: "Girls Who Lead",
    description:
      "A program helping teenage girls build confidence, leadership, and practical life skills.",
    matches: (summary: string) => summary === "girls who lead",
    icon: BookOpenCheck,
  },
  {
    title: "Adult Qa'idah Reading Program",
    description:
      "Guided Quran reading foundations for adults in a steady, supportive learning environment.",
    matches: (summary: string) => summary === "adult qa'idah reading program",
    icon: BookMarked,
  },
  {
    title: "Sister's Tajweed Halaqa",
    description:
      "A weekly sisters' circle for Tajweed practice, recitation, and continued learning.",
    matches: (summary: string) => summary.startsWith("sister's tajweed halaqa"),
    icon: MoonStar,
  },
] as const;

type CalendarState = {
  status: "loading" | "ready" | "error";
  events: CalendarEvent[];
};

const VANCOUVER_TIME_ZONE = "America/Vancouver";

function occurrenceLabels(event: CalendarEvent | undefined) {
  const startRaw = event?.start?.dateTime ?? event?.start?.date;
  if (!startRaw) return null;

  const isAllDay = Boolean(event?.start?.date) && !event?.start?.dateTime;
  const start = isAllDay
    ? new Date(`${startRaw}T12:00:00.000Z`)
    : new Date(startRaw);
  if (Number.isNaN(start.getTime())) return null;

  const displayTimeZone = isAllDay ? "UTC" : VANCOUVER_TIME_ZONE;
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: displayTimeZone,
    weekday: "short",
  }).format(start);

  if (isAllDay) return { day: `Next ${day}`, time: "All day" };

  const time = new Intl.DateTimeFormat("en-CA", {
    timeZone: VANCOUVER_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  });
  const endRaw = event?.end?.dateTime;
  const end = endRaw ? new Date(endRaw) : null;
  const formatTime = (date: Date) =>
    time
      .format(date)
      .replace(/a\.m\./i, "AM")
      .replace(/p\.m\./i, "PM");
  const timeLabel =
    end && !Number.isNaN(end.getTime())
      ? `${formatTime(start)} – ${formatTime(end)}`
      : formatTime(start);

  return { day: `Next ${day}`, time: timeLabel };
}

export function WeeklyProgramsSection() {
  const [calendar, setCalendar] = useState<CalendarState>({
    status: "loading",
    events: [],
  });

  useEffect(() => {
    const controller = new AbortController();
    fetchCalendarEvents(controller.signal, 48)
      .then((events) => setCalendar({ status: "ready", events }))
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Unable to load the GICC program schedule", error);
        setCalendar({ status: "error", events: [] });
      });
    return () => controller.abort();
  }, []);

  return (
    <section id="programs" className="programs-section" aria-labelledby="programs-heading">
      <div className="shell section-space">
        <div className="section-heading-row">
          <h2 id="programs-heading">Current programs, straight from the GICC calendar.</h2>
          <a className="text-link" href="/calendar/">
            See all events <ArrowDown aria-hidden="true" />
          </a>
        </div>
        <div
          className="program-list"
          aria-live="polite"
          aria-busy={calendar.status === "loading"}
        >
          {PROGRAMS.map((program) => {
            const Icon = program.icon;
            const event = calendar.events.find((candidate) =>
              program.matches(candidate.summary?.trim().toLowerCase() ?? ""),
            );
            const occurrence = occurrenceLabels(event);
            const schedule = occurrence ?? {
              day:
                calendar.status === "loading"
                  ? "Loading"
                  : "Schedule",
              time:
                calendar.status === "loading"
                  ? "Checking calendar"
                  : "See calendar",
            };
            return (
              <article key={program.title}>
                <span className="program-list__icon" aria-hidden="true"><Icon /></span>
                <div><h3>{program.title}</h3><p>{program.description}</p></div>
                <div className="program-list__schedule">
                  <strong>{schedule.day}</strong>
                  {occurrence || calendar.status === "loading" ? (
                    <span><Clock aria-hidden="true" /> {schedule.time}</span>
                  ) : (
                    <a href="/calendar/"><CalendarDays aria-hidden="true" /> {schedule.time}</a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
