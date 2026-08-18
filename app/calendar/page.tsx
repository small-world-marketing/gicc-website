import type { Metadata } from "next";
import { CommunityCalendar } from "@/components/CommunityCalendar";
import { MfasProgramSection } from "@/components/MfasProgramSection";


export const metadata: Metadata = {
  title: "Programs and Registrations",
  description:
    "Explore GICC weekly programs, current registrations, Muslim Funeral Aid Services, and upcoming community events in Guildford, Surrey.",
  alternates: { canonical: "/programs/" },
};

export default function ProgramsPage() {
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
      <MfasProgramSection />
    </>
  );
}
