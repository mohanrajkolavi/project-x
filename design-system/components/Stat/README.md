One big number that counts up in the hero finish, then says what it measures.

```html
<div class="ck-stack" data-ck-reveal>
  <span class="hero ck-hero ck-stat__num" data-ck-count="40" data-post="%">40%</span>
  <h2 class="headline ck-head" data-ck-words>cheaper per task.</h2>
  <p class="lead ck-lead">Compared with last month’s model, on the same tasks.</p>
</div>
```

- `data-ck-count` is the final value; `data-pre`, `data-post` and `data-decimals` format it. Write the final value as the text too, so it reads right without JavaScript.
- Size: `hero` for up to 4 characters, `hero-xl` for 1–2 digits. Longer values step down to `display`.
- The label names the unit and the qualifier ("per 1M tokens", "on paid plans").

You provide: the verified number, its unit and its context.
