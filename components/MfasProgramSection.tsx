import Link from "next/link";
import { ArrowUpRight, Check, HeartHandshake } from "lucide-react";
import { SITE } from "@/lib/site";
import styles from "./MfasProgramSection.module.css";

const MFAS_ENROLLMENT_URL = "https://muslimfas.ca/forms/";
const MFAS_WEBSITE_URL = SITE.mfasUrl;

export function MfasProgramSection() {
  return (
    <section id="mfas" className={styles.section} aria-labelledby="mfas-program-heading">
      <div className={`shell ${styles.layout}`}>
        <div className={styles.copy}>
          <p className={styles.partnership}>A GICC community partnership</p>
          <h2 id="mfas-program-heading">Muslim Funeral Aid Services</h2>
          <p className={styles.lede}>
            MFAS is a non-profit program founded through GICC to help Sunni
            Muslim families in British Columbia meet funeral and burial costs
            through a shared membership model.
          </p>
          <p>
            Participating members stand together so that a bereaved family does
            not have to carry the full financial burden alone. MFAS manages
            enrollment, eligibility, coverage, and support directly.
          </p>

          <div className={styles.actions}>
            <a
              className={styles.primaryAction}
              href={MFAS_ENROLLMENT_URL}
              target="_blank"
              rel="noreferrer"
            >
              Start enrollment on MuslimFAS
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a
              className={styles.secondaryAction}
              href={MFAS_WEBSITE_URL}
              target="_blank"
              rel="noreferrer"
            >
              Learn about MFAS
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>

          <p className={styles.disclosure}>
            Enrollment is completed securely on the official MuslimFAS website.
          </p>
        </div>

        <aside className={styles.guide} aria-labelledby="mfas-guide-heading">
          <HeartHandshake className={styles.guideIcon} aria-hidden="true" />
          <h3 id="mfas-guide-heading">Before you enroll</h3>
          <ul>
            <li>
              <Check aria-hidden="true" />
              <span>Review who is eligible and how family coverage works.</span>
            </li>
            <li>
              <Check aria-hidden="true" />
              <span>Have your household, emergency contact, and banking details ready.</span>
            </li>
            <li>
              <Check aria-hidden="true" />
              <span>Read the current program terms before submitting.</span>
            </li>
          </ul>
          <Link className={styles.termsLink} href="/mfas-terms/">
            Read GICC&apos;s MFAS terms
          </Link>
        </aside>
      </div>
    </section>
  );
}
