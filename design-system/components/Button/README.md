Three actions: the blue CTA capsule (the one ask), the planet button (go to the next section) and the text link.

**Capsule** `.ck-capsule`: `sig` fill, `on-sig` label in 600, mail glyph first, `radius-pill`, `glow-sig` resting and `glow-sig-peak` on hover. Add `.is-pulsing` on the final newsletter section so it breathes like the reel's loop end. Use it once per page, for the newsletter only.

```html
<a class="ck-capsule" href="NEWSLETTER-URL"><span data-ck-icon="mail" style="display:flex"></span><span>Join the free newsletter</span></a>
```

**Planet button** `.ck-next`: a teaser (what comes next, 14 characters or fewer) and a 44px planet with a chevron; on the last section the chevron becomes the mail glyph. **Link** `.ck-link`: `sig-text`, 600, arrow glyph that nudges 3px on hover.

You provide: the href (the real newsletter URL; never invent one) and the teaser text. Call `Caro.mount()` to fill `data-ck-icon` and `data-ck-planet` placeholders.

- Do keep the capsule label exactly "Join the free newsletter".
- Don't use the capsule for any other action, add secondary filled buttons or put two capsules in one view.
