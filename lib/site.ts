export const SITE = {
  name: "Guildford Islamic Cultural Center",
  shortName: "GICC",
  description:
    "Prayer times, programs, events, and community services from Guildford Islamic Cultural Center in Surrey, BC.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.giccmasjid.org",
  phoneDisplay: "+1 (604) 670-6732",
  phoneHref: "tel:+16046706732",
  email: "info@giccmasjid.org",
  addressLine: "15290 103A Ave #101",
  cityLine: "Surrey, BC V3R 7P8",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=15290%20103A%20Ave%20%23101%2C%20Surrey%2C%20BC%20V3R%207P8",
  donationUrl: "https://surreyislamiccenter.com/",
  awqatUrl: "https://www.awqat.net/masjid/masjid-guildford",
  monthlyPrayerUrl: "https://gicc.sash-group.com/monthly_prayer_times.aspx",
  calendarUrl:
    "https://calendar.google.com/calendar/u/0/r?cid=ammar%40giccmasjid.org",
} as const;

export const PRIMARY_NAV = [
  { label: "About", href: "/about/" },
  { label: "Programs", href: "/programs/" },
  { label: "Calendar", href: "/calendar/" },
  { label: "Book", href: "/event-request/" },
  { label: "New Masjid", href: "/new-masjid/" },
  { label: "Contact", href: "/contact/" },
] as const;

export const REGISTRATIONS = [
  {
    title: "Girls Who Lead",
    meta: "Teen girls · Ages 13–18",
    image: "/images/programs/optimized/girls-who-lead.webp",
    thumbnail: "/images/programs/optimized/girls-who-lead-thumb.webp",
    href: "https://tinyurl.com/giccdeendunya",
  },
  {
    title: "Madrasah Grades 8-12",
    meta: "Ibn Masood Madrasah",
    image: "/images/programs/optimized/madrasah-grades-8-12.webp",
    thumbnail: "/images/programs/optimized/madrasah-grades-8-12-thumb.webp",
    href: "https://bit.ly/gicc-madrasah",
  },
  {
    title: "Madrasah Grades 1-7",
    meta: "Ibn Masood Madrasah",
    image: "/images/programs/optimized/madrasah-grades-1-7.webp",
    thumbnail: "/images/programs/optimized/madrasah-grades-1-7-thumb.webp",
    href: "https://docs.google.com/forms/d/e/1FAIpQLScNVkR4Bhfh7dw_IIkpQpyNEkEododGvNDBDtOzytt4lbZpFw/viewform?vc=0&c=0&w=1&flr=0",
  },
  {
    title: "GICC United 2026",
    meta: "Soccer program",
    image: "/images/programs/optimized/gicc-united-2026.webp",
    thumbnail: "/images/programs/optimized/gicc-united-2026-thumb.webp",
    href: "https://bit.ly/giccsoccer",
  },
  {
    title: "Ibn Masood New Timings",
    meta: "Madrasah registration",
    image: "/images/programs/optimized/gicc-united-flyer-1.webp",
    thumbnail: "/images/programs/optimized/gicc-united-flyer-1-thumb.webp",
    href: "https://bit.ly/IbnMasood",
  },
  {
    title: "Weekend Arabic Program",
    meta: "Weekend classes",
    image: "/images/programs/optimized/gicc-united-flyer-2.webp",
    thumbnail: "/images/programs/optimized/gicc-united-flyer-2-thumb.webp",
    href: "https://bit.ly/gicc-weekend",
  },
  {
    title: "Ilm Essentials",
    meta: "Foundations course",
    image: "/images/programs/optimized/gicc-united-flyer-3.webp",
    thumbnail: "/images/programs/optimized/gicc-united-flyer-3-thumb.webp",
    href: "https://sites.google.com/view/ilm-essential-course/home",
  },
  {
    title: "High School Madrasah",
    meta: "Teen program",
    image: "/images/programs/optimized/gicc-united-flyer-4.webp",
    thumbnail: "/images/programs/optimized/gicc-united-flyer-4-thumb.webp",
    href: "https://bit.ly/HS-Madrasah",
  },
] as const;

export const LEGACY_ROUTES = [
  "/",
  "/about-us/",
  "/classic-1/",
  "/contact-us/",
  "/donate/",
  "/donation/",
  "/iqama-times/",
  "/mfas-terms/",
  "/monthly-prayer-times/",
  "/new-masjid/",
  "/privacy-policy/",
  "/test-page/",
  "/youth-mental-health-support/",
  "/eid-al-fitr-2022-announcement/",
  "/1st-annual-quran-competition-results/",
  "/eid-al-adha-salaah-and-festival/",
  "/category/uncategorized/",
  "/author/giccadmin/",
  "/author/partopia/",
] as const;

export const STATIC_ROUTES = [
  "/",
  "/about/",
  "/contact/",
  "/donate/",
  "/new-masjid/",
  "/youth-mental-health-support/",
  "/event-request/",
  "/privacy/",
  "/terms/",
  "/mfas-terms/",
  "/prayer-times/",
  "/programs/",
  "/events/",
] as const;

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": ["Mosque", "LocalBusiness"],
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  alternateName: SITE.shortName,
  url: SITE.url,
  logo: `${SITE.url}/images/gicc-logo-white.png`,
  telephone: "+1-604-670-6732",
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "15290 103A Ave #101",
    addressLocality: "Surrey",
    addressRegion: "BC",
    postalCode: "V3R 7P8",
    addressCountry: "CA",
  },
  areaServed: ["Guildford", "Surrey", "British Columbia"],
} as const;
