A glass capsule that fills with the palette gradient to show one comparable number, such as a price or a limit.

```html
<div class="ck-meter" style="--v:40%">
  <div class="ck-meter__top"><span class="fine ck-meter__label">Output price per 1M tokens</span><span class="result ck-meter__value">$20</span></div>
  <div class="ck-meter__track"><div class="ck-meter__fill"></div></div>
</div>
```

- `--v` is the value as a percentage of a shared maximum. Give every meter in a group the same maximum so lengths compare honestly.
- The label says what the number measures ("per 1M tokens", "per month"); the value repeats the exact figure in `sig-text`.
- Inside a `data-ck-reveal` block the fill grows from zero over `dur-count` with `glow-fill`.

You provide: the label, the value text and the percentage.

- Don't use a meter for a single number with nothing to compare against; use a Stat.
