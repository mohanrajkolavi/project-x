The site header: the planet avatar and handle on the left, the Webb star and the page's label on the right.

It carries over the carousel header exactly: a 40px "MK" sphere in a 60px hairline orbit with one moon at 140°, then `@mohanrajkolavi`; on the right a Webb six-spike star in `sig-text` and the page label in `meta`.

```html
<header class="ck-header">
  <div class="ck-header__bar">
    <a class="ck-me" href="/">
      <span class="ck-planet" data-ck-planet="140"><span class="ck-planet__sphere"><span class="ck-planet__mk">MK</span></span></span>
      <span class="meta ck-meta-text">@mohanrajkolavi</span>
    </a>
    <div class="ck-series"><span data-ck-webb></span><span class="meta ck-meta-text">Top 10</span></div>
  </div>
</header>
<script>Caro.mount(document)</script>
```

You provide: the page label (the post type: "Top 10", "Explained", "Prompt pack", "Weekly AI Wrap"; 16 characters or fewer, sentence case) and the home link.

- Do keep it sticky and transparent over the sky; no bar fill, no blur panel, no bottom border.
- Do keep the label to one or two words. Put site navigation, if you need any, in the footer or behind the avatar link.
- Don't add issue numbers ("No. 01") or extra icons.
