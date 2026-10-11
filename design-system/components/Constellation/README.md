Progress as a constellation: sections already seen are lit blue and joined, the current one glows, the rest wait faintly.

```html
<footer class="ck-footer">
  <svg id="progress"></svg>
  <button class="ck-next meta" type="button"><span id="teaser">How it works</span>
    <span class="ck-planet ck-planet--btn" data-ck-planet="-140"><span class="ck-planet__sphere" data-ck-icon="chevron"></span></span></button>
</footer>
<script>
  Caro.init(document);
  Caro.progress(document.getElementById('progress'), document.querySelectorAll('.ck-section'),
    function (n, section) { /* update the teaser to the next section's name */ });
</script>
```

- `Caro.constellation(svg, n, N)` draws step `n` of `N`; `Caro.progress(svg, sections, onChange)` keeps it in step with scrolling.
- Pair it with the planet button: its teaser names the next section in 14 characters or fewer; on the last section the chevron becomes the mail glyph.
- Fits up to 20 points. Points use `sig-text`, `star` and `dot-on`.

You provide: the sections and their short teaser names.
