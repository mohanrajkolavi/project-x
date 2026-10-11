A copy-ready prompt or request: a label over a hairline, the prompt in curly quotes with [fill-ins] in blue, and a "You get" line.

```html
<div class="ck-prompt">
  <div class="meta ck-prompt__label"><span>Copy this prompt</span>
    <button class="ck-prompt__copy meta" type="button" data-ck-copy><span data-ck-icon="copy" style="display:flex"></span><span>Copy</span></button></div>
  <p class="prompt ck-prompt__text">“Summarise this in <span class="ck-fill">[3]</span> bullets for <span class="ck-fill">[my manager]</span>.”</p>
  <p class="result ck-result">You get · a short, sendable summary</p>
</div>
<script>Caro.init(document)</script>
```

- Prompt text in `prompt` (`t1`), 160 characters or fewer, curly quotes. Each [fill-in] is a `.ck-fill` span: `sig-text`, 600, never broken across lines.
- The copy button copies the prompt text; if the clipboard is refused it selects the text instead.
- The result line uses `result` in `sig-text`: "You get · …", or the product name · what it does.

You provide: the prompt, its fill-ins and what the reader gets back. Say where to paste it nearby.

- Don't put a prompt in a code block or a grey box; the hairline is the container.
