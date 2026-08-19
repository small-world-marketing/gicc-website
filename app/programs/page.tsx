import type { Metadata } from "next";
import { EventsBoard } from "@/components/EventsBoard";
import { RegistrationsCarousel } from "@/components/RegistrationsCarousel";

export const metadata: Metadata = {
  title: "Programs and Events",
  description:
    "Browse and filter every upcoming GICC event, kept up to date by our team.",
  alternates: { canonical: "/programs/" },
};

export default function ProgramsPage() {
  return (
    <>
      <header className="content-hero content-hero--dark interior-hero">
        <div className="shell narrow">
          <p className="section-note">Learn, connect, and grow</p>
          <h1>Programs &amp; Events</h1>
          <p>
            Browse every upcoming GICC event to find what matters to you.
          </p>
        </div>
      </header>
      <RegistrationsCarousel />
      <EventsBoard />
    </>
  );
}
