"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, MoonStar } from "lucide-react";
import Image from "next/image";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
  deriveEvents,
  fetchEvents,
  isPhoneNumber,
  normalizeSafeHttpUrl,
  posterImageSrc,
  telHref,
  type SheetEvent,
} from "@/lib/events";

type RegistrationItem = {
  title: string;
  meta: string;
  thumbnail: string;
  href: string;
  isPhone: boolean;
  programNames: string[];
};

type EventsState = {
  status: "loading" | "ready" | "error";
  events: SheetEvent[];
};

function registrationMeta(event: SheetEvent): string {
  const audience = [event.audience, event.ageRange ? `Ages ${event.ageRange}` : null].filter(Boolean).join(" · ");
  return audience || event.category || event.location;
}

function toRegistrationItem(event: SheetEvent): RegistrationItem | null {
  if (!event.registrationLink) return null;
  const thumbnail = posterImageSrc(event.posterLink);
  if (!thumbnail) return null;

  const isPhone = isPhoneNumber(event.registrationLink);
  const href = isPhone ? telHref(event.registrationLink) : normalizeSafeHttpUrl(event.registrationLink);
  if (!href) return null;

  return { title: event.name, meta: registrationMeta(event), thumbnail, href, isPhone, programNames: [event.name] };
}

function uniqueRegistrations(items: RegistrationItem[]): RegistrationItem[] {
  const byPosterAndDestination = new Map<string, RegistrationItem>();

  for (const item of items) {
    const key = `${item.thumbnail}\u0000${item.href}`;
    const existing = byPosterAndDestination.get(key);
    if (!existing) {
      byPosterAndDestination.set(key, item);
      continue;
    }

    if (!existing.programNames.includes(item.title)) existing.programNames.push(item.title);
  }

  return [...byPosterAndDestination.values()];
}

export function RegistrationsCarousel() {
  const [state, setState] = useState<EventsState>({ status: "loading", events: [] });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchEvents()
      .then((events) => {
        if (!cancelled) setState({ status: "ready", events });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Unable to load the GICC events sheet", error);
        setState({ status: "error", events: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const registrations = useMemo(() => {
    const upcoming = deriveEvents(state.events).filter((event) => !event.isPast);
    return uniqueRegistrations(upcoming
      .map(toRegistrationItem)
      .filter((item): item is RegistrationItem => item !== null));
  }, [state.events]);

  const count = registrations.length;
  const active = count > 0 ? registrations[activeIndex % count] : null;

  const move = (direction: number) => {
    setActiveIndex((current) => (current + direction + count) % count);
  };

  const goTo = (index: number) => setActiveIndex(((index % count) + count) % count);

  const offsetOf = (index: number) => {
    let distance = index - activeIndex;
    if (distance > count / 2) distance -= count;
    if (distance < -count / 2) distance += count;
    return distance;
  };

  const onStageKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  };

  if (state.status === "loading") return null;
  if (state.status === "error" || count === 0 || !active) return null;

  return (
    <section id="registrations" className="registrations-section" aria-labelledby="registrations-heading">
      <div className="shell section-space registrations-layout">
        <header className="registrations-heading">
          <p className="arabic-label" lang="ar">برامجنا</p>
          <h2 id="registrations-heading">Programs &amp; Registrations</h2>
          <div className="carousel-divider" aria-hidden="true">
            <span />
            <MoonStar />
            <span />
          </div>
        </header>

        <p id="registration-carousel-instructions" className="sr-only">
          Choose a flyer or use the left and right arrow keys to browse programs.
        </p>
        <div
          className="coverflow-stage"
          role="region"
          aria-roledescription="carousel"
          aria-label="Program flyers"
          aria-describedby="registration-carousel-instructions"
          onKeyDown={onStageKeyDown}
        >
          {registrations.map((item, index) => {
            const offset = offsetOf(index);
            const distance = Math.abs(offset);
            const isActive = offset === 0;

            return (
              <button
                className="registration-card"
                data-offset={offset}
                key={`${item.thumbnail}\u0000${item.href}`}
                type="button"
                aria-label={isActive ? `${item.programNames.join(", ")}, selected` : `Show ${item.programNames.join(", ")}`}
                aria-pressed={isActive}
                aria-hidden={distance > 1 ? "true" : undefined}
                tabIndex={distance <= 1 ? 0 : -1}
                onClick={() => {
                  if (isActive) {
                    window.open(item.href, "_blank", "noopener,noreferrer");
                    return;
                  }
                  goTo(index);
                }}
                style={{ zIndex: 20 - distance }}
              >
                <Image
                  src={item.thumbnail}
                  alt={isActive ? `${item.programNames.join(", ")} — ${item.meta}` : ""}
                  fill
                  sizes="(max-width: 639px) 224px, (max-width: 1039px) 296px, 336px"
                  loading={index === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              </button>
            );
          })}
        </div>

        <div className="carousel-controls">
          <button className="carousel-arrow" type="button" onClick={() => move(-1)} aria-label="Previous registration">
            <ChevronLeft aria-hidden="true" size={28} strokeWidth={2.6} />
          </button>
          <div className="carousel-dots" role="group" aria-label="Choose a registration">
            {registrations.map((item, index) => (
              <button
                key={`${item.thumbnail}\u0000${item.href}`}
                type="button"
                aria-label={`Show ${item.programNames.join(", ")}`}
                aria-pressed={index === activeIndex}
                onClick={() => goTo(index)}
              >
                <span />
              </button>
            ))}
          </div>
          <button className="carousel-arrow" type="button" onClick={() => move(1)} aria-label="Next registration">
            <ChevronRight aria-hidden="true" size={28} strokeWidth={2.6} />
          </button>
        </div>

        <div className="registration-caption" aria-live="polite">
          <h3>{active.programNames.length === 1 ? active.title : "Related programs"}</h3>
          <p>{active.programNames.length === 1 ? active.meta : active.programNames.join(" · ")}</p>
          <a className="button button--gold" href={active.href} target="_blank" rel="noreferrer">
            <ArrowUpRight aria-hidden="true" /> Register now
          </a>
        </div>
      </div>
    </section>
  );
}
