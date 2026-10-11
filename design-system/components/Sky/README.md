The vector night sky behind every page: faint stars in three real tints, soft glows, a Webb six-spike star, a tiny galaxy and palette-tinted galaxy haze.

```html
<body class="ck-root pal-lagoon hero-sky">
  <canvas class="ck-sky" aria-hidden="true"></canvas>
  <main class="ck-page">…</main>
  <script>Caro.sky(document.querySelector('.ck-sky'));</script>
</body>
```

- `Caro.sky(canvas, {seed, density, drift})`: about 325 stars per 1080×1350 of screen, denser along a winding band; haze at 70% in the page palette (read from `--pal-1..3`, so it follows `.pal-<name>`). `drift` is pixels per second (default 4; the reel uses 34). Twinkle and drift stop under reduced motion.
- `.ck-sky` is fixed to the viewport behind `.ck-page`; `.ck-sky--contained` fills a positioned parent instead (a hero band, a card image).
- It redraws on resize and when `data-theme` changes; on White it drops to half-strength haze.

You provide: a canvas, and the palette class on an ancestor.

- Don't add brighter or bigger elements to "liven it up", and never cut the haze out behind text.
