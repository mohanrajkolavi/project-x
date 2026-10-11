An Apple keynote set in deep space, for @mohanrajkolavi (MK). Pure black, huge Montserrat type, one idea per screen, a quiet vector night sky, and a few crafted details: the planet avatar, the Webb-star label, the constellation progress. Restraint and precision; nothing that isn't needed. This is the system behind the `/caro` carousels and `/reel` videos, set out here for building websites. Learning comes first, design second, everything else third.

## Voice and content

- Teach it fully. Every page answers a beginner's questions in order: what it is, why it matters, how it works, where to find it, when to use it (and when not), what it costs, what goes wrong, the catch, what to do next.
- Explain every term where it first appears, in five words or fewer: "tokens (chunks of text)", "API (how apps talk to it)".
- Plain words. Reading grade 8 or below; sentences of 15 words or fewer (20 at most). Write like a sharp friend.
- Swap: utilize → use, approximately → about, however → but, enables → lets.
- Never write: revolutionary, game-changer, unlock, supercharge, delve, seamless, cutting-edge, unleash, robust, "It's not just X, it's Y", "doesn't just X".
- American English, sentence case everywhere. Headlines end with "." or "?". Curly quotes and apostrophes (“ ” ’). No em dashes. No serial comma. Join label parts with " · " ("Cheat sheet · Save this").
- Numbers: digits for 2 and up, "40%", "10×", "$20", "100K", "1M", dates as "Sep 22". Say what each number measures ("per 1M tokens", "per month") and keep its qualifier ("on paid plans"). The same number reads the same everywhere.
- Exact product names, with a non-breaking space inside model names (`Opus 5.5`). [Fill-ins] never break across lines.
- One ask: the free newsletter. Fixed copy: headline "Stay ahead of AI.", sub "AI news, tech, prompts and links to skills. In your inbox every week.", button "Join the free newsletter". Never invent a newsletter name or URL; no follow, share or comment asks.
- Honest. No screenshots of other products, no logos, no fake quotes, no invented numbers or durations. No clickbait, all caps or emoji.

Real copy to match:

> 5 Claude upgrades you missed. Three are free.
> Pick by the job.
> You get · a ready-to-send reply
> Best for · Big, long projects

## Visual foundations

### Themes

- Black is the default and the brand. Set `data-theme="black"` (or nothing) on `<html>`; `data-theme="white"` gives the White theme. Both are complete; never mix them on one page.
- `bg` is the only surface. There are no grey cards and no tinted panels: depth comes from the sky, glass art and glows.

### Colour

- Text: `t1` primary, `t2` sub lines and body, `t3` fine print and labels. The muted second headline line is `sec`.
- Signature blue does the UI work: `sig` for fills (CTA capsule, planet button, checked dots) with `on-sig` text on top; `sig-text` for kickers, links, yes/free status, [fill-ins], result lines, the constellation and the focus ring.
- Everything else stays neutral. `div` draws hairlines.
- **One palette and one hero finish per page**, chosen for the topic. Put `.pal-<name>` and `.hero-<name>` on `<body>` (or a section). The palette (`aurora`, `orchid`, `lagoon`, `electric`, `twilight`, three stops each) colours line art, gradient strokes, meter fills and the sky haze. The hero finish (`mint`, `orchid`, `sky`, `titanium`, `white`) is a single hue running vertically, light at the top to deep at the bottom, like Apple's colour titles. It goes on hero numerals and on at most one gradient word.
- Pairings that work: aurora + mint, orchid + orchid, lagoon + sky (the site default), electric + sky or titanium, twilight + titanium or white. Give neighbouring pages different pairs.
- Never put a horizontal multi-colour gradient across a numeral or a word. Never orange.

### Type

- Montserrat only (Google Fonts, weights 400–800), fallback `-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`. Load it with `<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">`.
- Web scale: `hero-xl` and `hero` (800, tracking −0.05em, in a hero finish) → `display` and `headline` (700, line height 1.04, −0.04em) → `title` → `lead` (500, `t2`, balanced) → `body` → `fine` (`t3`). `kicker` sits above a headline in `sig-text`. `meta` is header and footer text.
- At most three text levels per section. Headlines get `text-wrap: balance`; a two-line headline puts its second line in `sec` (or, once per page, in the hero finish).
- Nothing below 15px on the web (`fine`, `meta`). On the 1080 canvas the floor is 24px.
- The **Frame 1080** group keeps the exact caro and reel sizes for social images, OG cards and video stills drawn on a 1080-wide canvas.
- Sizes shrink on phones with the clamp in each style's note. Never let a hero numeral wrap; keep it to 4 characters (1–2 at `hero-xl`).

### Layout

- One idea per section, the way one frame holds one idea. A section is a full-width band with `space-10` padding top and bottom (`space-11` for the hero and the newsletter close). Height follows content; don't force 100vh.
- Content column: `page-max` (1080px) with a gutter of `clamp(16px, 7.4vw, 80px)` (`space-9` on desktop, `space-4` minimum on phones), so the text measure is `measure` (920px) on desktop. Running text narrows to about 65 characters.
- Each section has one dominant element: a hero numeral, a headline, a rows list, a prompt or a piece of art. Art sits in empty space beside or above the words and never touches them.
- Alternate layouts down the page (numeral hero, headline + sub, rows, art left, art centred) so neighbouring sections never look the same.
- Page arc: a hero that states the count or the question → content sections in learning order → a cheat sheet (rows recapping everything) → the newsletter close.

### The sky

- A fixed vector night sky sits behind every page: about 325 faint stars per 1080×1350 of area in three real tints (`star-cool`, `star-white`, `star-warm`), soft glows on the brightest, a Webb six-spike star every two or three screens, one or two tiny galaxies, and a band of galaxy haze tinted by the page palette at 70% strength.
- The haze is one even layer. Never mask, fade or cut it behind text: holes read as a black glow.
- Keep bright stars and spikes clear of words, the header and the footer. When in doubt, fewer and fainter.
- On White the sky drops to `star` dots and half-strength haze.

### Glass art

- Every illustration is vector line art from the library (Art assets): one 3px primary stroke (`stroke-primary`), 2–2.4px secondary, round caps and joins, generous radii (`radius-lg` to `radius-bubble`), a palette gradient stroke, a faint palette-tinted glass fill (22% at the top to 3% at the bottom) and a soft blurred glow of the same stroke behind it.
- No background-colour fills, ever. Where an icon sits over an orbit ring, the ring is hidden with a vector mask cut to the icon's shape, never by painting black on top.
- Opacity 0.35–1. Pick the piece by meaning: podium (rankings), chip (models), network (how models work), comet (speed, launch, free), bars (falling prices), bulb (explainers), shield (safety, privacy), magnifier (research), bubbles (email, chat), cards (lists), condense (summaries), week (schedules), trip (travel), versus (comparisons), timeline (history), envelope (newsletter), orbits (around a cover numeral), dayarc (planning a day).

### Light, borders and radii

- Shadows are light, not darkness: `glow-sig` on the CTA capsule (`glow-sig-peak` on hover and at the pulse peak), `glow-planet` on spheres, `glow-fill` on meters and progress lines. No drop shadows; nothing dark behind text or icons.
- Borders are 1px `div` hairlines between rows and above prompt blocks. No boxed cards.
- Radii: `radius-pill` for every button and capsule, 50% for spheres and dots, `radius-sm` for meter tracks, `radius-lg`/`radius-xl` for glass panels drawn as art.

### Motion

The reel engine's grammar, applied to scroll and load:

- One continuous scene, never a slideshow. Every change is a transformation: words rise, finished things lift away, the answer rises.
- New things enter from the right or from below; finished things leave left or up. One hero motion per section; everything else supports it.
- Words slide up out of a clipping mask, `dur-word` each, staggered by `dur-stagger`, eased `ease-out`. Sub lines and rows fade up over `dur-fade`.
- Hero numerals settle with `ease-back`; orbits draw in over `dur-draw` and their planets keep travelling slowly.
- Glass art draws its strokes over `dur-draw`, then the glass fill fades in. Icons float a few pixels on a slow sine.
- Stats count up over `dur-count` to the verified value. Meters fill with `glow-fill`. Myths get a blue strike (`glow-strike`) before the fact lands in the hero finish.
- Always alive, never busy: the sky drifts and twinkles; nothing else loops except the CTA pulse.
- Hold anything meant to be read for at least `dur-hold-min`. Never auto-advance text faster than 5 words a second.
- Content is readable at rest: if JavaScript or motion is off, everything is simply there. Respect `prefers-reduced-motion` by skipping rises, counts and drift (keep fades under 200ms).

### States

- Focus: a solid 2px `sig-text` outline with a 3px offset on every interactive element (7:1 on Black, 5.6:1 on White).
- Hover: the capsule's glow grows to `glow-sig-peak`; the planet button's chevron nudges 3px right; text links underline.
- Disabled: 0.4 opacity, no glow.

## Iconography

- UI glyphs are the four kit strokes: arrow (links), chevron (next), mail (newsletter), down (story CTA). 24px, 2.1–2.6px stroke, round caps. Inline them as SVG with `currentColor`; the Glyphs assets are drawn in white ink for `<img>` use on Black.
- Brand marks: the planet avatar ("MK" on a blue sphere in a hairline orbit with one moon at 140°) and the Webb six-spike star in `sig-text` with a `webb-core` centre. Brand assets are drawn for Black.
- The Art assets are rendered in the lagoon palette for Black. For other palettes, render them from caro's `art.py` after `theme.apply(palette, hero)`.
- No emoji, no stock icons, no third-party logos.

## Components

Every component's styles live in `components/bundle.css` (classes start with `ck-`); `components/bundle.js` (`window.Caro`) adds the sky, word reveals, count-ups, constellation progress and glyph strings. No framework is needed. Wrap the page in `.ck-root` with a palette and hero class, for example `<body class="ck-root pal-lagoon hero-sky">`.

## Never

Ocean or water imagery, the moon, busy cards or tiles, glow bands, star charts, bitmap skies, issue numbers ("No. 01"), orange, horizontal multi-colour gradients on a numeral, the same colour pair on every page, sharp or lopsided icon shapes, black fills or dark halos behind text, sources shown on the page, more than one ask.
