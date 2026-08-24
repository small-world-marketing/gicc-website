import type { Metadata } from "next";
import { CommunityCalendar } from "@/components/CommunityCalendar";

export const metadata: Metadata = {
  title: "Community Calendar",
  description:
    "Upcoming programs and events at GICC, synced live from our community calendar.",
  alternates: { canonical: "/calendar/" },
};

export default function CalendarPage() {
  return (
    <>
      <header className="content-hero content-hero--dark interior-hero">
        <div className="shell narrow">
          <p className="section-note">Learn, connect, and grow</p>
          <h1>Community Calendar</h1>
          <p>
            Upcoming programs and events at GICC, synced live from our community calendar.
          </p>
        </div>
      </header>
      <CommunityCalendar />
    </>
  );
}
