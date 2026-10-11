# Newsletter site with admin CMS

A newsletter website and the admin to run it, built on the **Caro Cosmic Keynote** design system
(black, Montserrat, a vector night sky, hairline rows, one ask: the free newsletter).

- **Public site:** a front page that reads like a feed of short stories (latest story first, then
  more stories with their art and reading time), issue pages with "Read next" stories, the archive with
  search, sections (one per post type, like Explained or Prompt pack), topics, about, RSS, sitemap.
  Navigation and search sit in a full-screen menu behind the avatar, as the design system asks.
  The signup form closes every page, with double opt-in, a welcome email and one-click unsubscribe.
- **Admin (`/admin`):** dashboard (audience, traffic, open and click rates, top issues, referrers,
  signup sources), an issue editor with live preview, email sends with preview, test send and
  per-send reports, subscribers (search, add, import, CSV export), outbox, settings and team.

## Run it

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000
```

Open `http://localhost:3000/admin`. The first visit asks you to make the owner account and can add
3 sample issues (and, for a test drive, demo readers and traffic with example.com addresses).

Production:

```bash
npm run build
npm start
```

Needs Node 20.9 or newer. Data lives in SQLite at `data/newsletter.db` (set `DATABASE_PATH` to move
it). Run it as a long-lived Node server with a persistent disk (a VPS, Fly.io, Railway, Render and so
on). Serverless hosts won't keep the database or finish background sends.

## Email

With no mail server set, every email (confirmations, tests, sends) is kept in **Admin › Outbox** so
you can read it and click its links while testing. To send for real, add any SMTP service in
**Admin › Settings** or with environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS`, `SMTP_SECURE`, `MAIL_FROM`). Set `SITE_URL` (or the site address in settings) so links
in emails point at your domain.

Sends go to every active subscriber in small batches in the background and pick up again after a
restart. Opens use a tracking pixel and clicks go through a counter that only forwards for real
deliveries. Every email has a one-click unsubscribe (RFC 8058) header and link.

## Writing issues

Issue bodies are Markdown with a few extras that map to the design system components:

| Write | You get |
| --- | --- |
| `---` | a new section (one idea per section) |
| `@center` as a section's first line | a centred section |
| `#### Kicker` | the small blue line above a headline |
| `## First line. / Second line.` | a two-line headline, second line muted |
| `## First. / *Second.*` | the second line in the page's hero finish (once per page) |
| a paragraph right after a headline | the lead |
| ` ```rows ` with `Name \| Status \| yes` | hairline rows; `yes` turns the status blue |
| ` ```steps ` with `[x] Done` or plain lines | numbered or ticked steps |
| ` ```prompt ` with `[fill-ins]`, then `You get · …` | a copy-ready prompt block |
| ` ```stat ` with value, headline, context | a big counting number |
| ` ```meter ` with `Label \| $20 \| 40` | a glass meter filled to 40% |
| ` ```versus ` with `A \| B`, rows, `Verdict:` | a two-column comparison |
| ` ```flip ` with `Kicker:`, `Myth:`, `Fact:`, `Proof:` | myth struck through, fact in the hero finish |
| ` ```art ` with `bulb` | a piece of glass line art |
| ` ```numeral ` with `5` | a hero numeral in orbits |

The editor has buttons that insert each block and a guide under the body field. Each issue also picks
a palette and hero finish pairing, an art piece and an optional hero number. Art is recoloured on the
fly for the chosen palette.

## Project layout

```
design-system/          Caro tokens, components and assets (source of truth)
src/caro/               tokens.css, bundle.css and bundle.js used by the app
src/app/(site)/         public pages
src/app/admin/          sign-in, setup and the admin panel; actions.ts holds every admin action
src/app/api/            page-view, open and click tracking, one-click unsubscribe
src/lib/                database, auth, content, Markdown renderer, email, sends, analytics
src/components/         shared Caro pieces, site chrome, admin UI and charts
```

Page views are counted with a daily salted hash of IP and browser, so no reader can be followed
across days, and browsers that send Do Not Track are skipped.
