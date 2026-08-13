"use client";

import { ArrowUpRight, CalendarDays, ExternalLink, MapPin, Phone, Tag, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchEvents, type SheetEvent } from "@/lib/events";

type FilterDimension = "category" | "audience";

type DerivedEvent = SheetEvent & {
  isRecurring: boolean;
  recurrenceLabel: string;
  startValue: number;
  hasStarted: boolean;
  endValue: number;
  isPast: boolean;
};

type EventsState = {
  status: "loading" | "ready" | "error";
  events: SheetEvent[];
};

const VANCOUVER_TIME_ZONE = "America/Vancouver";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: VANCOUVER_TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

function deriveEvents(events: SheetEvent[]): DerivedEvent[] {
  const todayKey = new Date().toISOString().slice(0, 10);
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
      return b.startValue - a.startValue || a.name.localeCompare(b.name);
    });
}

function startDateLabel(event: DerivedEvent) {
  return dateFormatter.format(new Date(`${event.startDate}T12:00:00.000Z`));
}

function scheduleLabel(event: DerivedEvent) {
  const timeRange =
    event.startTime && event.endTime
      ? `${event.startTime} – ${event.endTime}`
      : event.startTime || event.endTime || "";

  if (!event.isRecurring) return timeRange;

  const cadence = [event.days, event.recurrenceLabel].filter(Boolean).join(" · ");
  return timeRange ? `${cadence} · ${timeRange}` : cadence;
}

function categoryTags(category: string): string[] {
  return category
    .split(/\s*&\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const AUDIENCE_SYNONYMS: Record<string, string[]> = {
  "Adult Male": ["Adults", "Men"],
  "Adult Female": ["Adults", "Women"],
  "Boys Only": ["Boys"],
  "Girls Only": ["Girls"],
};

// Always shown as filter options, even when the sheet currently has no matching rows.
const AUDIENCE_BASE_OPTIONS = ["Adults", "Men", "Women", "Boys", "Girls", "Youth"];

function audienceTags(audience: string): string[] {
  return audience
    .split(/\s*&\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .flatMap((part) => AUDIENCE_SYNONYMS[part] ?? [part]);
}

function distinctSorted(values: string[]) {
  return Array.from(new Set(values.filter((value) => typeof value === "string" && value.length > 0))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function priceLabel(price: string) {
  return /^\$0(\.0+)?$/.test(price.trim()) ? "Free" : price;
}

function isPhoneNumber(value: string) {
  return /^\+?[\d\s().-]{7,}$/.test(value.trim());
}

function telHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

const LOCATION_MAP_LINKS: Record<string, string> = {
  "GICC Youth Center": "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("14888 104 Avenue, Surrey, BC"),
  "Guildford Islamic Cultural Center":
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("15290 103A Ave #101, Surrey, BC V3R 7A2"),
  "GICC Masjid": "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("15290 103A Ave #101, Surrey, BC V3R 7A2"),
  "Fraser Heights Community Park": "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("10588 160 St, Surrey, BC V4N 0A1"), 
  "Ibn Masood Madrasah":
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("15290 103A Ave #101, Surrey, BC V3R 7A2"),
    "Hjorth Park": "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("10275 148 St, Surrey, BC V3R 6S4"),
};

function driveFileId(url: string): string | null {
  const pathMatch = url.match(/\/file\/d\/([^/]+)/);
  if (pathMatch) return pathMatch[1];
  const queryMatch = url.match(/[?&]id=([^&]+)/);
  return queryMatch ? queryMatch[1] : null;
}

function posterProxySrc(posterLink: string) {
  const fileId = driveFileId(posterLink);
  return fileId ? `/api/poster?id=${encodeURIComponent(fileId)}` : posterLink;
}

function PosterThumbnail({
  name,
  posterLink,
  disabled,
}: {
  name: string;
  posterLink?: string;
  disabled?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!posterLink || failed) {
    return (
      <div className="events-card__poster events-card__poster--empty">
        <span>No poster available</span>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="events-card__poster" aria-label={`Poster for ${name}`}>
        <img src={posterProxySrc(posterLink)} alt="" loading="lazy" onError={() => setFailed(true)} />
      </div>
    );
  }

  return (
    <a
      className="events-card__poster"
      href={posterLink}
      target="_blank"
      rel="noreferrer"
      aria-label={`View poster for ${name}`}
    >
      <img src={posterProxySrc(posterLink)} alt="" loading="lazy" onError={() => setFailed(true)} />
    </a>
  );
}

export function EventsBoard() {
  const [state, setState] = useState<EventsState>({ status: "loading", events: [] });
  const [selected, setSelected] = useState<Record<FilterDimension, Set<string>>>({
    category: new Set(),
    audience: new Set()
  });
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents(controller.signal)
      .then((events) => setState({ status: "ready", events }))
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Unable to load the GICC events sheet", error);
        setState({ status: "error", events: [] });
      });
    return () => controller.abort();
  }, []);

  const derivedEvents = useMemo(() => deriveEvents(state.events), [state.events]);

  const upcomingEvents = useMemo(() => derivedEvents.filter((event) => !event.isPast), [derivedEvents]);
  const pastEventCount = derivedEvents.length - upcomingEvents.length;
  const baseEvents = showPast ? derivedEvents : upcomingEvents;

  const filterOptions = useMemo(
    () => ({
      category: distinctSorted(derivedEvents.flatMap((event) => categoryTags(event.category))),
      audience: distinctSorted([
        ...AUDIENCE_BASE_OPTIONS,
        ...derivedEvents.flatMap((event) => audienceTags(event.audience)),
      ]),
    }),
    [derivedEvents],
  );

  const filteredEvents = useMemo(
    () =>
      baseEvents.filter((event) => {
        if (
          selected.category.size > 0 &&
          !categoryTags(event.category).some((tag) => selected.category.has(tag))
        )
          return false;
        if (
          selected.audience.size > 0 &&
          !audienceTags(event.audience).some((tag) => selected.audience.has(tag))
        )
          return false;
        return true;
      }),
    [baseEvents, selected],
  );

  const activeFilterCount = Object.values(selected).reduce((total, set) => total + set.size, 0);

  function toggleFilter(dimension: FilterDimension, value: string) {
    setSelected((previous) => {
      const next = new Set(previous[dimension]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...previous, [dimension]: next };
    });
  }

  function clearFilters() {
    setSelected({ category: new Set(), audience: new Set()});
  }

  function renderFilterGroup(dimension: FilterDimension, label: string, options: readonly string[]) {
    if (options.length === 0) return null;
    return (
      <div className="events-filter-group" key={dimension}>
        <span className="events-filter-group__label">{label}</span>
        <div className="events-filter-group__options">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className="events-filter-button"
              aria-pressed={selected[dimension].has(option)}
              onClick={() => toggleFilter(dimension, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section id="events" className="events-section" aria-label="All GICC events">
      <div className="shell section-space">
        <div className="section-heading-row">
          {activeFilterCount > 0 ? (
            <button type="button" className="text-link events-clear-filters" onClick={clearFilters}>
              Clear filters ({activeFilterCount})
            </button>
          ) : null}
          <button
            type="button"
            className="text-link events-toggle-past"
            aria-pressed={showPast}
            onClick={() => setShowPast((previous) => !previous)}
          >
            {showPast ? "Hide past events" : `Show past events${pastEventCount > 0 ? ` (${pastEventCount})` : ""}`}
          </button>
        </div>

        <div className="events-filter-bar" aria-label="Filter events">
          {renderFilterGroup("category", "Category", filterOptions.category)}
          {renderFilterGroup("audience", "Audience", filterOptions.audience)}
        </div>

        <div className="events-grid" aria-live="polite" aria-busy={state.status === "loading"}>
          {state.status === "loading"
            ? [0, 1, 2, 3].map((row) => (
                <div className="events-card events-card--skeleton" key={row} aria-hidden="true">
                  <span className="calendar-skeleton calendar-skeleton--title" />
                  <span className="calendar-skeleton calendar-skeleton--meta" />
                </div>
              ))
            : null}

          {state.status !== "loading" && baseEvents.length === 0 ? (
            <div className="calendar-empty events-empty">
              <CalendarDays aria-hidden="true" />
              <h3>
                {state.status === "error"
                  ? "Couldn't load events right now"
                  : showPast
                    ? "No events found"
                    : "No upcoming events"}
              </h3>
              <p>
                {state.status === "error"
                  ? "Please try again shortly, or reach out if this keeps happening."
                  : showPast
                    ? "There are no past or upcoming events to show."
                    : "Check back soon for upcoming events."}
              </p>
              {state.status === "error" ? (
                <a className="button button--light" href="/contact/">
                  <ExternalLink aria-hidden="true" /> Contact Us
                </a>
              ) : null}
            </div>
          ) : null}

          {state.status !== "loading" && baseEvents.length > 0 && filteredEvents.length === 0 ? (
            <div className="calendar-empty events-empty">
              <CalendarDays aria-hidden="true" />
              <h3>No events match these filters</h3>
              <p>Try clearing a filter to see more events.</p>
              <button type="button" className="button button--light" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          ) : null}

          {filteredEvents.map((event, index) => (
            <article
              className={event.isPast ? "events-card events-card--past" : "events-card"}
              aria-disabled={event.isPast || undefined}
              key={`${event.name}-${event.startDate}-${index}`}
            >
              <PosterThumbnail name={event.name} posterLink={event.posterLink} disabled={event.isPast} />
              <div className="events-card__body">
                {event.category ? <p className="events-card__eyebrow">{event.category}</p> : null}
                <h3>{event.name}</h3>
                <p className="events-card__start">
                  <CalendarDays aria-hidden="true" />{" "}
                  {event.isRecurring ? `Starts ${startDateLabel(event)}` : startDateLabel(event)}
                </p>
                {scheduleLabel(event) ? <p className="events-card__schedule">{scheduleLabel(event)}</p> : null}
                <ul className="events-card__meta">
                  {event.audience ? (
                    <li>
                      <Users aria-hidden="true" />
                      {event.audience}
                      {event.ageRange ? ` · Ages ${event.ageRange}` : ""}
                    </li>
                  ) : null}
                  {event.location ? (
                    <li>
                      <MapPin aria-hidden="true" />
                      {LOCATION_MAP_LINKS[event.location] ? (
                        <a href={LOCATION_MAP_LINKS[event.location]} target="_blank" rel="noreferrer">
                          {event.location}
                        </a>
                      ) : (
                        event.location
                      )}
                    </li>
                  ) : null}
                  {event.price ? (
                    <li className="events-card__meta-price">
                      <Tag aria-hidden="true" />
                      {priceLabel(event.price)}
                    </li>
                  ) : null}
                </ul>
                {event.registrationLink && !event.isPast ? (
                  <div className="events-card__actions">
                    {isPhoneNumber(event.registrationLink) ? (
                      <a className="button button--gold" href={telHref(event.registrationLink)}>
                        <Phone aria-hidden="true" /> Call {event.registrationLink}
                      </a>
                    ) : (
                      <a className="button button--gold" href={event.registrationLink} target="_blank" rel="noreferrer">
                        <ArrowUpRight aria-hidden="true" /> Register
                      </a>
                    )}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}