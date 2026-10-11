Numbered or ticked steps joined by a gradient line: how to start, a checklist, a recap.

```html
<ol class="ck-steps">
  <li class="ck-step"><span class="ck-step__dot"><span data-ck-icon="check" style="display:contents"></span></span><span class="row-name ck-step__text">Open Settings, then Features</span></li>
  <li class="ck-step is-done">…</li>
</ol>
<script>Caro.mount(document)</script>
```

- Dots are 44px rings in `sig-text` with the step number; `.is-done` fills the dot `sig` and shows a white check.
- One line per step, 40 characters or fewer, starting with a verb. Use the exact names shown on screen ("Settings › Features").
- Six steps at most; split longer flows.

You provide: the steps in order, and which are done if it's a checklist.
