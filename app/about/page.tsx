import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "About GICC",
  description: "Learn about Guildford Islamic Cultural Center and its service to Muslim families in Surrey, BC.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="Our story"
      title="A community centre rooted in worship"
      lede="GICC was established by local Muslim families who wanted a permanent place to pray, learn, serve, and grow together in Guildford."
      tone="dark"
    >
      <h2>From a weekly prayer to a community home</h2>
      <p>
        The need for a place of worship in Guildford became clear in 2008, when
        local brothers began holding Jumu&apos;ah at the Guildford Library. As the
        community grew, volunteers secured a small musallah and later moved to
        the current centre on 103A Avenue in 2014.
      </p>
      <p>
        Today, GICC hosts the five daily prayers, Jumu&apos;ah, Qur’an and Islamic
        studies, youth programs, family activities, and community support. Our
        congregation represents the many cultures and backgrounds that make
        Guildford and Surrey home.
      </p>
      <h2>Our purpose</h2>
      <p>
        We work to preserve Islamic identity, nurture a viable Muslim community,
        and promote a comprehensive Islamic way of life based on the Qur’an and
        the Sunnah of Prophet Muhammad ﷺ.
      </p>
      <blockquote>
        GICC is not only a mosque. It is a community centre for everyone.
      </blockquote>
    </ContentPage>
  );
}
