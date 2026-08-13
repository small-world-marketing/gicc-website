# Decisions Log

## 2026-07-29 — Give condolence requests a dedicated confirmation page

**Context:** Condolence gathering requests previously ended on the generic space-request success state. The client requested a more considerate confirmation experience and a concise introduction to Muslim Funeral Aid Services.

**Choice:** Redirect successful condolence submissions to `/event-request/condolence-thank-you/`, preserve the generated request reference in the URL, keep the page out of search results, and link MFAS information to its official website and GICC's local terms page. Other request types retain the existing confirmation state.

**Consequences:** Families receive a clearer next-step message during a sensitive workflow without changing D1 storage, staff notifications, approval rules, or MFAS's role as the enrollment source of truth.

## 2026-07-22 — Stage the production hostname without moving authoritative DNS

**Context:** GICC's authoritative DNS and mail remain on the current hosting provider. Moving nameservers without a complete zone export would risk the website, MX records, and other services during launch.

**Choice:** Associate `www.giccmasjid.org` with the Cloudflare Pages project first, then cut over only the existing `www` record to `gicc-website.pages.dev`. Keep the apex and mail-related DNS unchanged until a separately verified zone migration is approved.

**Consequences:** The new site can launch with one reversible DNS edit while the WordPress origin and email service remain available during the fallback window.

## 2026-07-22 — Keep the public Turnstile site key build-safe

**Context:** The Pages project is deployed by direct upload and does not inject public build variables. A runtime-only secret validates Turnstile responses, but the browser also needs the widget's non-secret site key at build time.

**Choice:** Keep `NEXT_PUBLIC_TURNSTILE_SITE_KEY` as an override and embed the provisioned GICC widget site key as the production-safe fallback. Store `TURNSTILE_SECRET_KEY` only as a Cloudflare Pages secret.

**Consequences:** The booking form consistently renders anti-spam verification in manual and Git-connected builds without exposing the Turnstile secret.

## 2026-07-22 — Keep the public Awqat client key as a build-safe fallback

**Context:** The approved staging site loaded prayer times with Awqat's public Supabase anonymous key. The migration changed that value to an optional build variable, but the manually managed Cloudflare Pages project has no build environment and would therefore render empty prayer-time cards after production deployment.

**Choice:** Preserve the environment-variable override while embedding the same public anonymous client key already shipped by the prior public site. This value is a browser credential governed by Awqat's row-level access policy, not a privileged server secret.

**Consequences:** Prayer and Jumu'ah times load in manual and Git-connected builds without an undocumented environment prerequisite. Awqat can still rotate the client key through `NEXT_PUBLIC_AWQAT_SUPABASE_ANON_KEY` before a rebuild.

## 2026-07-22 — Derive program highlights from the shared calendar

**Context:** The homepage listed four manually authored program names and times that did not match the current GICC calendar. Several of the names were not present in the active calendar, and Ibn Mas'ood Madrasah was shown as a weekday-afternoon program even though its current occurrences are on weekends.

**Choice:** Keep the descriptive program highlights, but derive each displayed next date and time from the public `ammar@giccmasjid.org` calendar through the existing same-origin calendar proxy. Highlight only current calendar programs, and show a calendar link rather than a guessed time when a matching occurrence is unavailable.

**Consequences:** Program cards remain useful editorial highlights while schedule changes made by staff propagate to the public website automatically. The shared Google Calendar is now the schedule source of truth for both the event list and program-highlight times.

## 2026-07-15 — Consolidate utility content into permanent public routes

**Context:** A fresh crawl of the live WordPress site confirmed that every retained editorial route had already been represented in Next.js, but prayer times, program registrations, and the calendar were only discoverable as homepage anchors. The existing youth-support page also contains a sensitive intake form whose operational owner and data-handling rules are not documented.

**Choice:** Add `/prayer-times/` as the canonical replacement for both legacy prayer pages and `/programs/` as a permanent hub for weekly programs, registrations, and the community calendar. Expose retained pages through the primary and footer navigation. Keep the youth-support resource page public, but do not recreate its intake form until GICC approves the recipient, consent, retention, and access model.

**Consequences:** High-intent utility content now has crawlable, shareable URLs without duplicating its live data sources. The homepage preserves the approved sections. The youth intake remains an explicit production gate instead of silently sending sensitive data through the general booking workflow.

## 2026-07-15 — Revalidate Next.js static chunks instead of treating them as immutable

**Context:** Next.js 16/Turbopack reused the same generated CSS chunk URL after a stylesheet-only production build. The previous one-year `immutable` browser policy therefore allowed returning visitors to keep stale styles after a deployment.

**Choice:** Serve `/_next/static/*` with `max-age=0, must-revalidate`. Keep Cloudflare at the edge, but require browsers to validate cached chunks before reuse. A separate global heading-case stylesheet also gives this rollout a new asset URL so clients that already cached the old immutable stylesheet receive the uppercase H1 treatment immediately.

**Consequences:** CSS and JavaScript changes propagate reliably across direct-upload deployments. Repeat visits may perform lightweight conditional requests instead of blindly reusing year-old chunks.

## 2026-07-14 — Use the published GitHub Pages build as the visual and editorial baseline

**Context:** The client preferred the typography, spacing, copy, icons, flyer coverflow, Awqat prayer experience, and Google Calendar presentation in the last published staging build.

**Choice:** Treat `origin/main@3fd5a56` and the matching published GitHub Pages site as the canonical homepage reference. Preserve its Cormorant/Poppins typography, colour layers, responsive geometry, copy, eight-slide flyer order, Awqat prayer-time experience, and community calendar presentation in the semantic Next.js migration.

**Exceptions:** Keep the client-approved space-request flow at `/event-request/` instead of restoring the obsolete existing-program booking form. Keep the removed Young Champs flyer out of the carousel; the current GICC United 2026 flyer remains in its place.

**Consequences:** Future visual or copy changes should be compared against the published reference unless the client explicitly approves a new direction. The migration may change implementation details for accessibility, security, and reliability without changing the approved surface.

## 2026-07-14 — Proxy the public community calendar through Cloudflare

**Context:** The reference site called the Google Calendar API directly from the browser. That required a public browser key and failed completely when the API was unavailable. Google’s public ICS feed also contains an outdated fixed Vancouver offset, which makes winter recurring events one hour early unless corrected.

**Choice:** Load calendar events through the same-origin `/api/calendar` Pages Function. Use an optional server-runtime Calendar API key first, then a cached public ICS fallback that expands recurrences with the `America/Vancouver` IANA timezone and serves stale data during temporary upstream failures.

**Consequences:** The homepage keeps the reference calendar UI and event links without exposing a browser key. Production may optionally provision a server-only Google Calendar API key restricted to the Calendar API; the verified public-calendar feed remains operational without it.

## 2026-07-14 — Convert the approved staging site to the SWM migration stack

**Context:** The staging homepage was a Vite/React Native Web prototype on GitHub Pages. The SWM WordPress migration playbook locks production sites to Next.js static export, TypeScript, Cloudflare Pages, semantic SEO, and documented operations.

**Options considered:** Keep Vite; wrap the existing React Native Web app in Next.js; rewrite the approved surface as semantic Next.js components.

**Choice:** Rewrite in Next.js 16 with strict TypeScript and preserve the approved GICC visual direction and source assets.

**Reasoning:** This removes the prototype-only architecture, improves crawlability and accessibility, and avoids carrying React Native Web into a content-first website.

**Consequences:** Build output changes from `dist/` to `out/`. GitHub Pages is retired in favour of Cloudflare Pages.

## 2026-07-14 — Treat space submissions as requests, not bookings

**Context:** The client clarified that the booking system is for proposed new recurring programs and one-time rentals, not seats in existing programs.

**Choice:** Remove the existing-program booking form. Link the homepage to `/event-request/`, where the original PDF is represented as a guided form with facility terms, typed signature, and certification upload.

**Consequences:** A submission has `pending` status until staff approval. The interface never claims the space is reserved.

## 2026-07-14 — Store requests in Cloudflare D1 and files in private R2

**Context:** The Supabase project referenced by the prototype is not accessible through the connected account. The migration playbook standardizes hosting and form execution on Cloudflare.

**Options considered:** Continue posting anonymously to the inaccessible Supabase table; create a new paid Supabase project; use Cloudflare D1/R2 beside the Pages Function.

**Choice:** Use D1 for structured request tracking and private R2 for certification files. Send notifications through the standard MailerSend Pages Function pattern.

**Reasoning:** This keeps the public form server-side, avoids exposing privileged database credentials, and removes the additional $10/month Supabase project dependency.

**Consequences:** The public form writes a pending request to D1; it does not create a Google Calendar event or reserve either facility. Request review stays private.

## 2026-07-14 — Use the existing GICC calendar for internal space management

**Context:** Staff need a quick way to see open times and reserve a location for approved public requests or internally planned programs. The shared calendar `ammar@giccmasjid.org` already records events with the location values `GICC Masjid` and `GICC YEC`.

**Options considered:** Expose an admin calendar on the public site; build a second scheduling database; use the existing shared Google Calendar as the internal source of truth.

**Choice:** Use the existing shared Google Calendar for staff availability and confirmed bookings. Keep public submissions in D1 as pending requests until a staff member approves one and creates an opaque calendar event for the correct location.

**Reasoning:** Google Calendar already provides staff access control, recurring events, conflict visibility, notifications, and mobile support. A second booking calendar would create sync and double-booking risk without improving the public request flow.

**Consequences:** Staff must use the exact location value `GICC Masjid` or `GICC YEC` and leave confirmed events opaque so they block time. A future request-review dashboard must be protected before deployment; it should read from D1 and link into Google Calendar rather than becoming another scheduling source of truth.

## 2026-07-14 — Keep editorial content in-repo for the migration preview

**Context:** The SWM Payload CMS is the long-term default, but no GICC tenant, site record, deploy hook, or client account has been provisioned yet.

**Choice:** Keep the small set of migrated editorial pages in typed TSX for the preview and document Payload provisioning as a production handoff gate.

**Reasoning:** The preview can be verified without coupling launch readiness to incomplete CMS account setup. The route structure is compatible with later CMS-backed content.

**Consequences:** Program copy changes require a commit until the GICC tenant is provisioned and content is imported.

## 2026-07-14 — Retire expired and test WordPress URLs with HTTP 410

**Context:** The old sitemap contains test pages, duplicate templates, expired Eid announcements, author archives, and a Quran competition results page listing minors.

**Choice:** Return `410 Gone` with `noindex` for those URLs instead of copying outdated or privacy-sensitive content or blanket-redirecting it to the homepage.

**Consequences:** Search engines can remove retired URLs cleanly while retained pages preserve semantic redirects or equivalent content.

## 2026-07-27 — Keep MFAS enrollment and program information on the official MFAS site

**Context:** The Programs page did not explain GICC's relationship with Muslim Funeral Aid Services. The Grades 8–12 Madrasah flyer also linked to `/mfas/`, a legacy path reserved for MFAS funeral-aid enrollment rather than the Madrasah application shown by the flyer.

**Choice:** Add a dedicated MFAS section to `/programs/` using `muslimfas.ca` as the source of truth for program information and enrollment. Link the primary action to the official MFAS enrollment page and retain GICC's local copy of the terms as supporting information. Restore the Grades 8–12 registration link to `https://bit.ly/gicc-madrasah`, decoded from the flyer QR code and verified to resolve to its published Google Form.

**Consequences:** Visitors can understand GICC's MFAS community partnership and enroll through the program's maintained website. The Madrasah flyer no longer sends families to the unrelated funeral-aid path.
