import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer id="contact" className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Image src="/images/gicc-logo-white.webp" alt={SITE.name} width={320} height={180} />
          <p>Serving the Muslim community in Guildford, Surrey, British Columbia.</p>
        </div>
        <div>
          <h2>Contact</h2>
          <div className="footer-links">
            <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer">{SITE.addressLine}, Surrey, BC</a>
          </div>
        </div>
        <div>
          <h2>Explore</h2>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/prayer-times/">Prayer &amp; Iqama Times</Link>
            <Link href="/programs/">Programs &amp; Events</Link>
            <Link href="/calendar/">Community Calendar</Link>
            <Link href="/event-request/">Request GICC Space</Link>
          </nav>
        </div>
        <div>
          <h2>Community</h2>
          <nav className="footer-links" aria-label="Community pages">
            <Link href="/about/">About GICC</Link>
            <Link href="/new-masjid/">New Masjid Project</Link>
            <Link href="/youth-mental-health-support/">Youth Mental Health Support</Link>
            <a href={SITE.mfasUrl} target="_blank" rel="noreferrer">Muslim Funeral Aid (MFAS)</a>
            <Link href="/donate/">Donate</Link>
            <Link href="/contact/">Contact Us</Link>
          </nav>
        </div>
        <div>
          <h2>Legal</h2>
          <nav className="footer-links" aria-label="Legal pages">
            <Link href="/privacy/">Privacy Policy</Link>
            <Link href="/terms/">Website Terms</Link>
            <Link href="/mfas-terms/">MFAS Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
