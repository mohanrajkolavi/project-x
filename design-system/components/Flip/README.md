Myth vs fact (or mistake vs fix): the claim is struck through in blue, then the fact lands in the hero finish with one line of proof.

```html
<div class="ck-flip" data-ck-reveal data-ck-flip>
  <p class="kicker ck-kicker">Myth 1</p>
  <h2 class="title ck-head"><span class="ck-strike">AI remembers everything you tell it.</span></h2>
  <p class="kicker ck-flip__fact-kicker">Fact</p>
  <p class="title ck-grad ck-head">Most chats start fresh unless memory is on.</p>
  <p class="lead ck-lead">Check Settings › Personalization › Memory.</p>
</div>
<script>Caro.init(document)</script>
```

- The strike draws across every line of the myth when the block scrolls in (`.is-flipped`), and the myth dims to `t3`. Without JavaScript, add `is-flipped` in the markup.
- Kickers: "Myth" / "Fact", or "Mistake" / "Fix", numbered.
- Myth and fact two lines each at most; the proof is one line, sourced.

You provide: the myth, the fact and the proof.
