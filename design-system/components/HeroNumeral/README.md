The cover moment: one huge number or short word in the page's hero finish, with five orbits drawing in around it.

```html
<section class="ck-section ck-section--hero">
  <div class="ck-container ck-stack ck-stack--center" data-ck-reveal>
    <p class="kicker ck-kicker ck-fade">Top 10 · Ranked by what they do for you</p>
    <div id="orb"><span class="hero-xl ck-hero">10</span></div>
    <h1 class="display ck-head" data-ck-words>Free AI tools<br><span class="ck-sec">worth trying.</span></h1>
  </div>
</section>
<script>Caro.init(document); Caro.orbits(document.getElementById('orb'));</script>
```

Sizes: `hero-xl` for one or two digits, `hero` for a rank ("03"), a year or a word of four characters or fewer ("Free"). The finish comes from the `.hero-<name>` class on the body or section (default `hero-sky`). `Caro.orbits(el, {k})` scales the rings with `k` when the numeral is wider.

You provide: the count (it must be the real count of what the page delivers), a two-line headline and an optional kicker.

- Do keep the numeral on one line and the headline under it, never art stacked above it.
- Don't use a horizontal multi-colour gradient on the numeral, or more than one hero numeral per screen.
