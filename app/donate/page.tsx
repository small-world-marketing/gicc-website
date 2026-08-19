import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Donate to GICC",
  description: "Support the new GICC masjid project and ongoing community centre expenses.",
  alternates: { canonical: "/donate/" },
};

export default function DonatePage() {
  return (
    <ContentPage
      eyebrow="Sadaqah jariyah"
      title="Support GICC’s future"
      lede="Your donation helps sustain the masjid today and build a permanent community home for generations to come."
      tone="dark"
    >
      <h2>Donate by card</h2>
      <p>
        Give online with a credit or debit card through the New Islamic Center project site.
      </p>
      <p>
        <a
          className="button button--gold"
          href={SITE.cardDonationUrl}
          target="_blank"
          rel="noreferrer"
        >
          Donate online
        </a>
      </p>
      <h2>Donate by e-Transfer</h2>
      <div className="donation-details">
        <p><strong>New Masjid Project</strong><br /><a href="mailto:newmasjid@giccmasjid.org">newmasjid@giccmasjid.org</a></p>
        <p><strong>Madrasah and centre expenses</strong><br /><a href="mailto:info@giccmasjid.org">info@giccmasjid.org</a></p>
      </div>
      <h2>Donate by bank wire</h2>
      <dl className="bank-details">
        <div><dt>Account name</dt><dd>Guildford Islamic Cultural Center</dd></div>
        <div><dt>Transit number</dt><dd>92750</dd></div>
        <div><dt>Institution number</dt><dd>004</dd></div>
        <div><dt>Account number</dt><dd>5011124</dd></div>
      </dl>
      <p>
        For donation receipts or transfer questions, email <a href="mailto:info@giccmasjid.org">info@giccmasjid.org</a>.
      </p>
    </ContentPage>
  );
}
