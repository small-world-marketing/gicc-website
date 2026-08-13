import type { Metadata } from "next";
import {
  BookOpen,
  ExternalLink,
  HandHeart,
  MapPin,
  MoonStar,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { HomePrayerExperience } from "@/components/PrayerTimes";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: "Guildford Islamic Cultural Center | GICC Surrey",
  description:
    "Guildford Islamic Cultural Center (GICC): daily prayer and iqama times, weekly programs, community events, and the New Islamic Center project in Surrey, BC.",
};

export default function HomePage() {
  const missionPoints = [
    { icon: MoonStar, label: "Daily salah and Jumu'ah" },
    { icon: BookOpen, label: "Madrasah and Quran programs" },
    { icon: UsersRound, label: "Youth and family support" },
    { icon: HandHeart, label: "New Islamic Center project" },
  ] as const;
  return (
    <>
      <HomePrayerExperience />

      <section id="welcome" className="welcome-section" aria-labelledby="welcome-heading">
        <div className="shell section-space welcome-layout">
          <div className="welcome-copy">
            <h2 id="welcome-heading">Prayer, learning, and service for the Muslim community of Guildford.</h2>
            <p className="lede">
              GICC is a masjid and community center committed to preserving Islamic
              identity, supporting a viable Muslim community, and promoting a
              comprehensive way of life based on the Quran and Sunnah.
            </p>
          </div>
          <ul className="mission-list">
            {missionPoints.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span className="mission-list__icon"><Icon aria-hidden="true" /></span>
                <strong>{label}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="booking" className="space-request-section" aria-labelledby="space-request-heading">
        <div className="shell section-space space-request-layout">
          <div className="space-request-copy">
            <p className="section-note">New programs and one-time rentals</p>
            <h2 id="space-request-heading">Request GICC space.</h2>
            <p>Request space for a new recurring program or a one-time private or community rental. We review each request against the GICC calendar and facility terms.</p>
          </div>
          <div className="space-request-card">
            <div className="space-request-card__heading">
              <span className="space-request-icon"><MapPin aria-hidden="true" /></span>
              <div>
                <p className="space-request-card__label">External public requests</p>
                <h3>Plan a new use of GICC space</h3>
              </div>
            </div>
            <p>This form is not for registering in an existing GICC program.</p>
            <Link className="button button--navy" href="/event-request/">
              Start a space request <ExternalLink aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="new-center" className="new-center-section" aria-labelledby="new-center-heading">
        <div className="shell section-space new-center-layout">
          <div>
            <h2 id="new-center-heading">Building a permanent house of worship in Guildford.</h2>
            <p>
              The new center project will create more room for prayer, education,
              youth programs, and community service as Guildford continues to grow.
            </p>
          </div>
          <div className="donation-panel">
            <p className="donation-panel__label">Project focus</p>
            <h3>14888 104 Ave</h3>
            <p>Future Islamic Center property in Surrey, BC.</p>
            <a className="button button--blue" href="https://surreyislamiccenter.com/" target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" /> Visit project site
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
