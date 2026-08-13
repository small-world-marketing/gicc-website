# Live WordPress Content Inventory

Snapshot verified against `giccmasjid.org` on 2026-07-15 using the WordPress REST API, Yoast sitemaps, and the published navigation. The live site exposes 13 published pages, 3 published posts, 1 category archive, and 2 author archives.

## Published pages

| WordPress route | Migration handling | Status |
|---|---|---|
| `/` | Keep at `/` | Implemented |
| `/about-us/` | `301` to `/about/` | Implemented |
| `/classic-1/` | `410 Gone` | Empty theme artifact |
| `/contact-us/` | `301` to `/contact/` | Implemented |
| `/donate/` | Keep at `/donate/` | Implemented |
| `/donation/` | `301` to `/donate/` | Duplicate page |
| `/iqama-times/` | `301` to `/prayer-times/` | Consolidated live Awqat page |
| `/mfas-terms/` | Keep at `/mfas-terms/` | Implemented |
| `/monthly-prayer-times/` | `301` to `/prayer-times/` | Consolidated monthly viewer |
| `/new-masjid/` | Keep at `/new-masjid/` | Implemented |
| `/privacy-policy/` | `301` to `/privacy/` | Updated policy implemented |
| `/test-page/` | `410 Gone` | WordPress test page |
| `/youth-mental-health-support/` | Keep at the same route | Resource page implemented; intake gate remains |

## Published posts and archives

The three published posts are expired event announcements or a privacy-sensitive competition results page. They remain `410 Gone` with the category and author archives because there is no continuing editorial or search value.

- `/eid-al-fitr-2022-announcement/`
- `/1st-annual-quran-competition-results/`
- `/eid-al-adha-salaah-and-festival/`
- `/category/uncategorized/`
- `/author/giccadmin/`
- `/author/partopia/`

## Functional equivalence

| WordPress function | New source of truth |
|---|---|
| Athan, Iqama, and Jumu'ah times | Awqat feed on `/prayer-times/` and the homepage |
| Monthly prayer table | Existing GICC monthly source in an accessible modal on `/prayer-times/` |
| Program flyers and registration links | `REGISTRATIONS` in `lib/site.ts`, surfaced on `/programs/` |
| Community schedule | Google Calendar feed on `/programs/` and the homepage |
| New Masjid embedded microsite | Focused `/new-masjid/` page linking to the project site |
| Contact form | Direct phone and role-based email paths on `/contact/` |
| Space request PDF | Validated public workflow on `/event-request/` |

## Sensitive intake gate

The WordPress youth-support page contains a mental-health intake form. The public resource content is retained, but that form must not be copied into the general booking pipeline. Before rebuilding it, GICC must confirm the responsible inbox/team, response SLA, minimum required fields, consent language, retention/deletion period, and the staff access list for this sensitive data.

## New migration-native hubs

- `/prayer-times/` consolidates the two legacy prayer pages and preserves both live and monthly views.
- `/programs/` gives weekly programs, registrations, and the live calendar a permanent crawlable route while retaining the approved homepage sections.
