import type { MetadataRoute } from "next";
import { SITE, STATIC_ROUTES } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-07-15T00:00:00.000Z");
  return STATIC_ROUTES.map((route) => ({
    url: new URL(route, SITE.url).toString(),
    lastModified,
    changeFrequency:
      route === "/" || route === "/prayer-times/" || route === "/programs/" || route === "/calendar/"
        ? "daily"
        : route === "/event-request/"
          ? "monthly"
          : "yearly",
    priority:
      route === "/"
        ? 1
        : route === "/prayer-times/" || route === "/programs/" || route === "/calendar/"
          ? 0.9
          : route === "/event-request/"
            ? 0.8
            : 0.6,
  }));
}
