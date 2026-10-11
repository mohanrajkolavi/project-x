The basic section voice: a kicker, a headline of at most two lines and one sub line.

```html
<div class="ck-stack" data-ck-reveal>
  <p class="kicker ck-kicker ck-fade">How to</p>
  <h2 class="headline ck-head" data-ck-words>5 everyday jobs<br><span class="ck-sec">to hand to AI.</span></h2>
  <p class="lead ck-lead ck-fade">Copy the request, fill the blanks, check the result.</p>
</div>
```

- Headline: `display` for the page hero, `headline` for sections; `t1` first line, the second in `.ck-sec` (`sec`). Once per page, the second line can take the hero finish with `.ck-grad` instead.
- Kicker: `kicker` in `sig-text`, sentence case, parts joined with " · ".
- Sub: `lead` in `t2`, balanced, 34em max. Running text uses `body` with `.ck-text`; qualifiers use `fine` with `.ck-fine`.
- Motion: `data-ck-reveal` on the block and `data-ck-words` on the headline make the words rise one by one when it scrolls in; `.ck-fade` children follow. Without JavaScript everything simply shows.

You provide: the copy. Headlines end with "." or "?"; every term is explained where it first appears.

- Don't use more than three text levels in one section, or set long paragraphs in `lead`.
