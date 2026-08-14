# Content Updates

## Current content homes

- Prayer and Jumu’ah times: Awqat public feed, surfaced on `/prayer-times/` and the homepage.
- Community calendar: Google Calendar `ammar@giccmasjid.org`, surfaced on the homepage's weekly programs snippet.
- Events board: Google Sheet (see [Adding a new event](#adding-a-new-event)), posters on Google Drive, surfaced on `/programs/`.
- Program registrations (outdated, kept in the codebase for reference — not actively maintained): `lib/site.ts` in this repo.
- Prayer and Jumu'ah times: Awqat public feed, surfaced on `/prayer-times/` and the homepage.
- Community calendar: Google Calendar `ammar@giccmasjid.org`, surfaced on `/programs/` and the homepage.
- Program registrations: `lib/site.ts` in this repo.
- Editorial and legal pages: route files under `app/`.
- Public space requests: Cloudflare D1 and private R2 after production bindings are configured.

## Adding a new event

Everything on `/programs/` is pulled live from the GICC Events Google Sheet — nothing about adding an event requires a code change or pull request.

1. Open the events sheet (`https://docs.google.com/spreadsheets/d/1p33_LNs80WWptg6cfT0OxW2-C1Yvh1AXQcnTOoGQos8/edit`) and add a new row.
2. Fill in the required columns (marked with `*` in the header): Event Name, Category, Audience, Start Date, Days, Recurrence, Location, Price.
   - `Recurrence` — set this to `One-time` for a single event, even if `Days` is also filled in just to note which day it falls on. The site uses `Recurrence`, not `Days`, to decide whether an event repeats; leaving it as anything other than `One-time` (e.g. `Weekly`) makes it a recurring event.
   - `Category` / `Audience` — combine multiple values with `&` (e.g. `Religious & Academic`), and the site automatically splits them into separate filter buttons.
   - `End Date` — leave blank for a one-time event or an open-ended recurring one; fill it in for anything with a known end (a session, a multi-day event).
3. Poster (optional) — upload the flyer to Google Drive (`https://drive.google.com/drive/folders/1GmjIfIRt8v8eEWaQso2R5SCfihovVFen?usp=sharing`), set sharing to "Anyone with the link can view," and paste that share link into `Poster Link`.
4. Registration (optional) — paste a registration URL, or a phone number if people should call in; the site automatically renders phone numbers as tap-to-call links.
5. Changes show up on the live site within a few minutes — the sheet is fetched fresh on each page load, not cached in this repo.

## Updating a registration

The `REGISTRATIONS` list on `/programs/` is outdated and no longer actively maintained now that the page shows live events from the Google Sheet, but it's kept in the codebase for reference. To edit it anyway: change `REGISTRATIONS` in `lib/site.ts`, add the flyer to `public/images/programs/`, include meaningful alt context in the title, verify the external URL, then open a pull request.

## Updating the weekly program list

Edit `WEEKLY_PROGRAMS` in `lib/site.ts`. Keep schedule information in Vancouver local time and confirm it against the public GICC calendar.

## Planned CMS handoff

Before client handoff, provision a `gicc` tenant and `giccmasjid` site in `cms.smallworld.ca`, import the retained WordPress pages, configure a Cloudflare Pages deploy hook, create a site-scoped build token, and invite the client’s main contact as `client_admin`.

The verified WordPress route inventory and migration handling live in [`content-inventory.md`](content-inventory.md).
