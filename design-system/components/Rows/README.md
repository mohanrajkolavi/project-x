Hairline rows with a name on the left and a short status on the right: cheat sheets, who-gets-it lists, plans and recaps.

```html
<ul class="ck-rows">
  <li class="ck-row is-yes"><span class="row-name ck-row__name">Free plan</span><span class="result ck-row__status">Yes</span></li>
  <li class="ck-row"><span class="row-name ck-row__name">API</span><span class="result ck-row__status">Coming later</span></li>
</ul>
```

- `.is-yes` turns the status `sig-text` (yes, free, included, the pick); otherwise it is neutral `t3`. Colour is never the only signal: the status words say it too.
- Names 22 characters or fewer, statuses 24 or fewer; keep rows parallel in grammar. Five rows read best, ten at most.
- `.ck-rows--ruled` adds a rule above the first row when the list follows other content directly.

You provide: the items, in a meaningful order (ranked, by plan, by step).

- Don't wrap rows in a card, add icons to every row or use zebra fills.
