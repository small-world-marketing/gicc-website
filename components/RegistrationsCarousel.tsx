"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, MoonStar } from "lucide-react";
import Image from "next/image";
import { KeyboardEvent, useState } from "react";
import { REGISTRATIONS } from "@/lib/site";

export function RegistrationsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = REGISTRATIONS[activeIndex];
  const count = REGISTRATIONS.length;

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
          {REGISTRATIONS.map((item, index) => {
            const offset = offsetOf(index);
            const distance = Math.abs(offset);
            const isActive = offset === 0;

            return (
              <button
                className="registration-card"
                data-offset={offset}
                key={item.title}
                type="button"
                aria-label={isActive ? `${item.title}, selected` : `Show ${item.title}`}
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
                  alt={isActive ? `${item.title} — ${item.meta}` : ""}
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
            {REGISTRATIONS.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Show ${item.title}`}
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
          <h3>{active.title}</h3>
          <p>{active.meta}</p>
          <a className="button button--gold" href={active.href} target="_blank" rel="noreferrer">
            <ArrowUpRight aria-hidden="true" /> Register now
          </a>
        </div>
      </div>
    </section>
  );
}
