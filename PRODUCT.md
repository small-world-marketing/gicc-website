# Product

## Register

brand

## Users

The Muslim community of Guildford / Surrey, BC, and people discovering the masjid for the first time. Two audiences weighted roughly equally:

- **Regulars (congregation):** return often, usually on mobile, for a fast answer — today's iqama times, Jumu'ah, what's on the calendar, a program registration link.
- **Newcomers / visitors:** new to the area or to Islam, forming a first impression. They need orientation (who GICC is, where it is, what happens here) and an easy, low-pressure way to get involved or attend.

The job to be done: "Tell me what I need to know about this masjid right now, and make me feel welcome doing it." A wide age range, so the interface has to stay legible and forgiving.

## Product Purpose

The public website for the Guildford Islamic Cultural Center (GICC) — a masjid and community center. It exists to be a welcoming, trustworthy front door: surface daily prayer/iqama times, weekly programs, community flyers and registrations, the live events calendar, the New Islamic Center project, and a clear public request path for new programs or one-time space rentals. Success looks like a newcomer leaving oriented and inclined to visit, while a regular gets their answer in seconds. The production target is a static multi-route Next.js site on Cloudflare Pages.

## Brand Personality

Modern, clear, trustworthy — but warm, not corporate. Voice is calm, plain-spoken, and welcoming; it informs rather than sells. The feeling on arrival should be "this is a well-run, caring community that has its act together," conveyed through organization and clarity rather than ornament or urgency. Confident and grounded, never loud.

## Anti-references

- **Cluttered WordPress mosque template** — busy sidebars, stock-photo sliders, mismatched widgets, the generic "masjid website" look.
- **Cold corporate SaaS** — sterile startup landing page: gradient blobs, floating glass cards, soulless "tech company" vibe. Modern must not tip into clinical.
- **Heavy ornamental cliché** — gold filigree, clip-art domes/crescents, dense arabesque borders used as decoration. Islamic identity is carried by tone and restraint, not motifs.
- **Loud / salesy** — donation pop-ups, urgency banners, countdowns, marketing-buzzword copy, hard-sell tone.

## Design Principles

1. **Welcome before you ask.** Orient and invite first; any request (visit, register, donate) comes after the visitor feels addressed. Newcomer clarity beats insider shorthand.
2. **Clarity is the aesthetic.** For this brand, "modern and well-organized" *is* the trust signal. Every section earns its place; hierarchy does the work that decoration would do elsewhere.
3. **Identity through restraint, not ornament.** Islamic character comes from typography, color, imagery, and tone — never gold filigree or clip-art domes. Tasteful over template.
4. **Serve regulars and newcomers in one breath.** Fast utility (iqama times, calendar) and a warm front door coexist on the same page; neither audience is an afterthought.
5. **Quiet confidence over urgency.** No pop-ups, no countdowns, no hard sells. The community's value speaks plainly; asks are honest and calm.

## Accessibility & Inclusion

Target **WCAG 2.1 AA**, tuned for an older-friendly community audience:

- Body text contrast ≥ 4.5:1; large/bold text ≥ 3:1. Hold muted/placeholder text to the same body bar.
- Comfortable, readable type sizes; avoid small low-contrast metadata as the only carrier of information.
- Touch targets ≥ 44×44px throughout (mobile-first congregation).
- Full keyboard operability with visible focus indicators; semantic landmarks and a sane heading order.
- Honor `prefers-reduced-motion` with a non-motion fallback for any animation.
- Meaningful alt text and link text that stands on its own.
