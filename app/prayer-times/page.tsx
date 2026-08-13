import type { Metadata } from "next";
import { PrayerTimesPageExperience } from "@/components/PrayerTimes";

export const metadata: Metadata = {
  title: "Prayer and Iqama Times",
  description:
    "Today’s Athan, Iqama, Jumu'ah, and monthly prayer times for Guildford Islamic Cultural Center in Surrey, BC.",
  alternates: { canonical: "/prayer-times/" },
};

export default function PrayerTimesPage() {
  return (
    <>
      <header className="content-hero content-hero--dark interior-hero">
        <div className="shell narrow">
          <p className="section-note">Synced live from Awqat</p>
          <h1>Prayer &amp; Iqama Times</h1>
          <p>
            View today’s Athan and Iqama times, Friday Jumu&apos;ah schedule, and the
            full monthly prayer calendar for GICC.
          </p>
        </div>
      </header>
      <PrayerTimesPageExperience />
    </>
  );
}
