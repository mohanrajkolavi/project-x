A two-column comparison: names on each side, one criterion per row, the winner of each row in blue, a verdict at the end.

```html
<div class="ck-versus">
  <div class="ck-versus__names"><span class="title">Option A</span><span class="title">Option B</span></div>
  <div class="ck-versus__row">
    <span class="result ck-versus__a is-win">$4 / $20</span>
    <span class="fine ck-versus__crit">Price per 1M tokens</span>
    <span class="result ck-versus__b">$10 / $50</span>
  </div>
  <p class="result ck-versus__verdict">Pick A for value, B for hard tasks.</p>
</div>
```

- `.is-win` marks the better value in `sig-text`; the verdict explains it in words, so colour is never the only signal.
- Five criteria at most; values 18 characters or fewer; the criterion says what is measured.
- On phones the criterion moves above its two values.

You provide: the two names, the criteria with both values and the winner (or none), and a verdict by use case.
