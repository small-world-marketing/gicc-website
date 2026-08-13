import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, HeartHandshake, Mail } from "lucide-react";
import { Suspense } from "react";
import { CondolenceRequestReference } from "@/components/CondolenceRequestReference";

const MFAS_WEBSITE_URL = "https://muslimfas.ca/";

export const metadata: Metadata = {
  title: "Condolence Request Received",
  description: "Confirmation that GICC received a condolence gathering request.",
  robots: { index: false, follow: false },
};

export default function CondolenceThankYouPage() {
  return (
    <div className="condolence-thanks">
      <header className="condolence-thanks__hero">
        <div className="shell narrow condolence-thanks__hero-inner">
          <span className="condolence-thanks__status-icon" aria-hidden="true">
            <CheckCircle2 />
          </span>
          <p className="section-note">Condolence gathering request received</p>
          <h1>JazakAllahu khayran</h1>
          <p className="condolence-thanks__lede">
            Your request has been sent to GICC. We know these arrangements often
            happen during a difficult time, and our team will review the requested
            date and space as soon as possible.
          </p>
          <Suspense fallback={null}>
            <CondolenceRequestReference />
          </Suspense>
        </div>
      </header>

      <section className="condolence-thanks__body" aria-labelledby="condolence-next-heading">
        <div className="shell">
          <div className="condolence-thanks__layout">
            <div className="condolence-thanks__next">
              <h2 id="condolence-next-heading">What happens next</h2>
              <ol>
                <li>The GICC secretary will review the requested time and location.</li>
                <li>You will receive an email if more information is needed or once a decision is made.</li>
                <li>The space is not reserved until GICC sends written confirmation.</li>
              </ol>
            </div>

            <aside className="condolence-thanks__mfas" aria-labelledby="condolence-mfas-heading">
              <HeartHandshake className="condolence-thanks__mfas-icon" aria-hidden="true" />
              <h2 id="condolence-mfas-heading">Muslim Funeral Aid Services</h2>
              <p>
                MFAS is a non-profit program founded through GICC that helps Sunni
                Muslim families in British Columbia share eligible funeral and burial
                costs through a community membership model.
              </p>
              <div className="condolence-thanks__mfas-links">
                <a href={MFAS_WEBSITE_URL} target="_blank" rel="noreferrer">
                  Learn about MFAS <ArrowUpRight aria-hidden="true" />
                </a>
                <Link href="/mfas-terms/">Read GICC&apos;s MFAS terms</Link>
              </div>
            </aside>
          </div>

          <div className="condolence-thanks__actions">
            <Link className="button button--navy" href="/">
              Return to GICC home
            </Link>
            <a className="condolence-thanks__contact" href="mailto:secretary@giccmasjid.org">
              <Mail aria-hidden="true" />
              Contact the secretary
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
