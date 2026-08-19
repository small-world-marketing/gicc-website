import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Cormorant, Poppins } from "next/font/google";
import { AttributionTracker } from "@/components/AttributionTracker";
import { JsonLd } from "@/components/JsonLd";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ORGANIZATION_JSON_LD, SITE } from "@/lib/site";
import "./globals.css";
import "./heading-case.css";
import "./carousel-arrows.css";

const displayFont = Cormorant({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const bodyFont = Poppins({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#002a48",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "GICC Guildford | Mosque and Community Centre in Surrey",
    template: "%s | GICC Guildford",
  },
  description: SITE.description,
  applicationName: SITE.shortName,
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "/",
    siteName: SITE.name,
    title: "GICC Guildford | Mosque and Community Centre in Surrey",
    description: SITE.description,
    images: [{ url: "/images/new-masjid-building.jpg", width: 1600, height: 900 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GICC Guildford",
    description: SITE.description,
    images: ["/images/new-masjid-building.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <JsonLd data={ORGANIZATION_JSON_LD} />
        <Suspense fallback={null}>
          <AttributionTracker />
        </Suspense>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <ScrollToTop />
      </body>
    </html>
  );
}
