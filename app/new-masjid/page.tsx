import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { MasjidBuildingPicture } from "@/components/MasjidBuildingPicture";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "New Masjid Project",
  description: "Help GICC establish a permanent Islamic centre for Guildford and Surrey.",
  alternates: { canonical: "/new-masjid/" },
};

export default function NewMasjidPage() {
  return (
    <ContentPage
      eyebrow="A permanent home"
      title="Building for the next generation"
      lede="GICC’s new Islamic centre will create lasting room for prayer, education, youth development, and community service."
      tone="dark"
    >
      <figure className="feature-image">
        <MasjidBuildingPicture alt="The new GICC Islamic centre building" />
      </figure>
      <h2>A home for worship and community life</h2>
      <p>
        The permanent centre will let GICC serve more families with daily prayer,
        madrasah classes, youth activities, community gatherings, and practical
        support. Every contribution helps turn that vision into a sustainable
        institution for Guildford.
      </p>
      <a
        className="button button--navy"
        href={SITE.donationUrl}
        target="_blank"
        rel="noreferrer"
      >
        Support the project
      </a>
    </ContentPage>
  );
}
