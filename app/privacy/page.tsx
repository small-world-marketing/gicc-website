import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How GICC collects, uses, protects, and retains personal information submitted through its website.",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Last updated July 14, 2026"
      title="Privacy policy"
      lede="This policy explains how Guildford Islamic Cultural Center handles personal information submitted through this website."
      tone="dark"
    >
      <h2>Information we collect</h2>
      <p>
        When you submit a space request, we collect the information you provide,
        including your name, contact details, event or program details,
        qualifications, electronic signature, acknowledgements, and any
        certification file you choose to upload.
      </p>
      <p>
        For security, spam prevention, and request attribution, the submission
        service may also collect the originating IP address, approximate location,
        network provider or ASN, browser and device information, referring page,
        campaign parameters, pages viewed during the session, and submission time.
        Campaign information does not intentionally contain your name, email, or phone.
      </p>
      <h2>How we use the information</h2>
      <ul>
        <li>Review, schedule, approve, decline, and administer space requests.</li>
        <li>Contact the request lead about availability, requirements, and decisions.</li>
        <li>Protect the website and GICC facilities from spam, abuse, and unsafe use.</li>
        <li>Understand which outreach channels bring people to GICC.</li>
      </ul>
      <h2>Service providers</h2>
      <p>
        The website uses Cloudflare for hosting, security, data storage, and file
        storage; MailerSend for request notifications; Google Calendar for the
        public community calendar; and Awqat for prayer-time information. These
        providers process limited information as needed to deliver their services.
      </p>
      <h2>Storage and access</h2>
      <p>
        Space requests and certification files are not publicly accessible.
        Access is limited to authorized GICC and website operations staff who need
        the information to review or administer requests. Information is retained
        only as long as reasonably required for those purposes and applicable
        record-keeping obligations.
      </p>
      <h2>Your choices and questions</h2>
      <p>
        To ask about, correct, or request deletion of information you submitted,
        {" "}<a href="/contact/">contact GICC</a>. GICC may retain
        information where required for legal, safety, fraud-prevention, or
        operational record-keeping purposes.
      </p>
    </ContentPage>
  );
}
