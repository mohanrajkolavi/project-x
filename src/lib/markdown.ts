import { Marked, type Token, type Tokens } from "marked";

/**
 * Caro markdown: plain Markdown plus a few conventions that map to the design system.
 *
 *   ---                      starts a new section (one idea per section)
 *   @center                  first line of a section (kept for older posts; ignored on the web)
 *   #### Kicker              small blue line above a headline
 *   ## First line. / Second.  two-line headline; the second line is muted
 *   ## First. / *Second.*     second line in the page's hero finish (once per page)
 *   ```rows    Name | Status | yes
 *   ```steps   [x] Done step / Open step
 *   ```prompt  The prompt with [fill-ins], then "You get · …"
 *   ```stat    40% / cheaper per task. / Context line
 *   ```meter   Label | $20 | 40
 *   ```versus  A | B, then Criterion | a | b | a, then Verdict: …
 *   ```flip    Kicker: Myth 1 / Myth: … / Fact: … / Proof: …
 *   ```art     bulb
 *   ```numeral 5
 */

export type Target = "web" | "email";
type Ctx = { target: Target; palette: string; base: string };

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const SAFE_URL = /^(https?:|mailto:|\/|#)/i;

function inlineMarked(ctx: Ctx) {
  const m = new Marked({ gfm: true, breaks: false });
  m.use({
    renderer: {
      html({ text }) {
        return esc(text);
      },
      link({ href, tokens }) {
        const label = this.parser.parseInline(tokens);
        let url = href || "";
        if (!SAFE_URL.test(url)) return label;
        if (ctx.target === "email" && url.startsWith("/")) url = ctx.base + url;
        const ext = /^https?:/i.test(url);
        if (ctx.target === "email") return `<a href="${esc(url)}" style="color:#2997FF;text-decoration:underline">${label}</a>`;
        return `<a href="${esc(url)}"${ext ? ' rel="noopener noreferrer" target="_blank"' : ""}>${label}</a>`;
      },
      image({ href, text }) {
        if (!SAFE_URL.test(href || "")) return "";
        const src = ctx.target === "email" && href.startsWith("/") ? ctx.base + href : href;
        if (ctx.target === "email") return `<img src="${esc(src)}" alt="${esc(text)}" style="max-width:100%;height:auto;border:0">`;
        return `<img class="ck-img" src="${esc(src)}" alt="${esc(text)}" loading="lazy">`;
      },
      codespan({ text }) {
        return ctx.target === "email" ? `<code style="font-family:Menlo,monospace;color:#FFFFFF">${text}</code>` : `<code>${text}</code>`;
      },
    },
  });
  return (s: string) => m.parseInline(s) as string;
}

// ---------- helpers for fenced blocks
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const cells = (l: string) => l.split("|").map((c) => c.trim());
function fills(html: string, ctx: Ctx): string {
  // [fill-ins] in prompts; skip anything already inside a tag
  return html.replace(/\[([^\]<>]{1,60})\]/g, (_, t) =>
    ctx.target === "email" ? `<span style="color:#2997FF;font-weight:600;white-space:nowrap">[${t}]</span>` : `<span class="ck-fill">[${t}]</span>`,
  );
}
function curly(s: string): string {
  return s
    .replace(/(^|[\s(\[])"/g, "$1“")
    .replace(/"/g, "”")
    .replace(/(^|[\s(\[])'/g, "$1‘")
    .replace(/'/g, "’");
}
export function artUrl(name: string, palette: string, base = ""): string {
  return `${base}/art/${encodeURIComponent(name)}.svg${palette && palette !== "lagoon" ? `?pal=${encodeURIComponent(palette)}` : ""}`;
}

// ---------- headline split: "First. / Second."
function headline(text: string, inline: (s: string) => string): { first: string; second: string; grad: boolean } {
  const i = text.indexOf(" / ");
  if (i < 0) return { first: inline(text), second: "", grad: false };
  let sec = text.slice(i + 3).trim();
  const grad = /^\*[^*].*\*$/.test(sec);
  if (grad) sec = sec.slice(1, -1);
  return { first: inline(text.slice(0, i).trim()), second: inline(sec), grad };
}

// ---------- web blocks (an article column; Caro components sized for reading)
function webFence(tok: Tokens.Code, ctx: Ctx, inline: (s: string) => string): string {
  const lang = (tok.lang || "").trim().toLowerCase();
  const L = lines(tok.text);
  switch (lang) {
    case "rows": {
      const items = L.map((l) => {
        const [name, status = "", flag = ""] = cells(l);
        const yes = /^(yes|y|pick|true|\*)$/i.test(flag);
        return `<li class="ck-row${yes ? " is-yes" : ""}"><span class="row-name ck-row__name">${inline(name)}</span><span class="result ck-row__status">${inline(status)}</span></li>`;
      });
      return `<ul class="ck-rows ck-rows--ruled">${items.join("")}</ul>`;
    }
    case "steps": {
      const items = L.map((l) => {
        const done = /^\[x\]\s*/i.test(l);
        const t = l.replace(/^\[[ x]\]\s*/i, "");
        return `<li class="ck-step${done ? " is-done" : ""}"><span class="ck-step__dot">${done ? CHECK : ""}</span><span class="row-name ck-step__text">${inline(t)}</span></li>`;
      });
      return `<ol class="ck-steps">${items.join("")}</ol>`;
    }
    case "prompt": {
      let label = "Copy this prompt";
      const body: string[] = [];
      let result = "";
      for (const l of L) {
        if (/^label:/i.test(l)) label = l.replace(/^label:\s*/i, "");
        else if (/^you get\b/i.test(l) || /^result:/i.test(l)) result = l.replace(/^result:\s*/i, "");
        else body.push(l);
      }
      let text = body.join(" ");
      if (!/^["“]/.test(text)) text = `“${text}”`;
      return `<div class="ck-prompt"><div class="meta ck-prompt__label"><span>${esc(label)}</span><button class="ck-prompt__copy meta" type="button" data-ck-copy>${COPY}<span>Copy</span></button></div><p class="prompt ck-prompt__text">${fills(inline(curly(text)), ctx)}</p>${result ? `<p class="result ck-result">${inline(result)}</p>` : ""}</div>`;
    }
    case "stat": {
      const [value = "", head = "", lead = ""] = L;
      return `<div class="ck-stat"><p class="ck-hero ck-stat__num" style="margin:0">${esc(value)}</p>${head ? `<p class="ar-stat-head">${inline(head)}</p>` : ""}${lead ? `<p class="ar-stat-lead">${inline(lead)}</p>` : ""}</div>`;
    }
    case "meter": {
      return L.map((l) => {
        const [label, value = "", pct = "0"] = cells(l);
        const v = Math.max(0, Math.min(100, parseFloat(pct) || 0));
        return `<div class="ck-meter" style="--v:${v}%"><div class="ck-meter__top"><span class="fine ck-meter__label">${inline(label)}</span><span class="result ck-meter__value">${inline(value)}</span></div><div class="ck-meter__track"><div class="ck-meter__fill"></div></div></div>`;
      }).join("");
    }
    case "versus": {
      const [names = "A | B", ...rest] = L;
      const [a, b = ""] = cells(names);
      let verdict = "";
      const rows = rest
        .filter((l) => {
          if (/^verdict:/i.test(l)) {
            verdict = l.replace(/^verdict:\s*/i, "");
            return false;
          }
          return true;
        })
        .map((l) => {
          const [crit, va = "", vb = "", win = ""] = cells(l);
          const w = win.toLowerCase();
          return `<div class="ck-versus__row"><span class="result ck-versus__a${w === "a" ? " is-win" : ""}">${inline(va)}</span><span class="fine ck-versus__crit">${inline(crit)}</span><span class="result ck-versus__b${w === "b" ? " is-win" : ""}">${inline(vb)}</span></div>`;
        });
      return `<div class="ck-versus"><div class="ck-versus__names"><span class="title">${inline(a)}</span><span class="title">${inline(b)}</span></div>${rows.join("")}${verdict ? `<p class="result ck-versus__verdict">${inline(verdict)}</p>` : ""}</div>`;
    }
    case "flip": {
      const get = (k: string) => (L.find((l) => l.toLowerCase().startsWith(k + ":")) || "").slice(k.length + 1).trim();
      const kicker = get("kicker") || "Myth";
      const factKicker = get("factkicker") || (kicker.toLowerCase().startsWith("mistake") ? kicker.replace(/mistake/i, "Fix") : kicker.replace(/myth/i, "Fact"));
      return `<div class="ck-flip is-flipped"><p class="kicker ck-kicker">${esc(kicker)}</p><p class="title ck-head"><span class="ck-strike">${inline(get("myth") || get("mistake"))}</span></p><p class="kicker ck-flip__fact-kicker">${esc(factKicker)}</p><p class="title ck-grad ck-head">${inline(get("fact") || get("fix"))}</p>${get("proof") ? `<p class="lead ck-lead">${inline(get("proof"))}</p>` : ""}</div>`;
    }
    case "art": {
      const [name = "bulb", width = "360"] = (L[0] || "bulb").split(/\s+/);
      const w = Math.max(120, Math.min(640, parseInt(width, 10) || 360));
      return `<img class="ar-art" src="${artUrl(name, ctx.palette)}" alt="" width="${w}" style="--w:${w}px" loading="lazy" decoding="async">`;
    }
    case "numeral":
      return `<p class="ar-numeral ck-hero">${esc((L[0] || "").slice(0, 4))}</p>`;
    default:
      return `<pre><code>${esc(tok.text)}</code></pre>`;
  }
}
const CHECK = '<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 22.5l6 6 12-13"></path></svg>';
const COPY = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"></rect><path d="M15.5 8.5V6.75a2.25 2.25 0 0 0-2.25-2.25h-6.5A2.25 2.25 0 0 0 4.5 6.75v6.5a2.25 2.25 0 0 0 2.25 2.25H8.5"></path></svg>';

function webToken(tok: Token, ctx: Ctx, inline: (s: string) => string): string {
  switch (tok.type) {
    case "heading": {
      const t = tok as Tokens.Heading;
      if (t.depth >= 4) return `<p class="ar-kicker">${inline(t.text)}</p>`;
      if (t.depth === 3) return `<h3>${inline(t.text)}</h3>`;
      const h = headline(t.text, inline);
      return `<h2>${h.first}${h.second ? ` <span class="${h.grad ? "nl-grad" : "ar-sec"}">${h.second}</span>` : ""}</h2>`;
    }
    case "paragraph":
      return `<p>${inline((tok as Tokens.Paragraph).text)}</p>`;
    case "list": {
      const t = tok as Tokens.List;
      const items = t.items.map((i) => `<li>${inline(i.text.replace(/\n+/g, " "))}</li>`).join("");
      return t.ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
    }
    case "blockquote":
      return `<blockquote>${inline((tok as Tokens.Blockquote).text.replace(/\n+/g, " "))}</blockquote>`;
    case "code":
      return webFence(tok as Tokens.Code, ctx, inline);
    case "table": {
      const t = tok as Tokens.Table;
      const head = t.header.map((c) => `<th>${inline(c.text)}</th>`).join("");
      const body = t.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c.text)}</td>`).join("")}</tr>`).join("");
      return `<div class="ck-table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
    }
    case "html":
      return `<p>${esc((tok as Tokens.HTML).text)}</p>`;
    case "space":
    case "hr":
      return "";
    default:
      return "text" in tok && typeof tok.text === "string" ? `<p>${inline(tok.text)}</p>` : "";
  }
}

// ---------- email blocks (inline styles, tables; dark email in the Caro look)
const E = {
  font: "font-family:Montserrat,-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;",
  t1: "#FFFFFF",
  t2: "rgba(255,255,255,0.72)",
  t3: "rgba(255,255,255,0.56)",
  sec: "#86868B",
  sig: "#2997FF",
  div: "rgba(255,255,255,0.16)",
};

function emailFence(tok: Tokens.Code, ctx: Ctx, inline: (s: string) => string): string {
  const lang = (tok.lang || "").trim().toLowerCase();
  const L = lines(tok.text);
  const row = (left: string, right: string, color: string, first: boolean) =>
    `<tr><td style="${E.font}padding:14px 0;${first ? "" : `border-top:1px solid ${E.div};`}color:${E.t1};font-size:18px;font-weight:600">${left}</td><td align="right" style="${E.font}padding:14px 0;${first ? "" : `border-top:1px solid ${E.div};`}color:${color};font-size:16px;font-weight:600">${right}</td></tr>`;
  switch (lang) {
    case "rows":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">${L.map((l, i) => {
        const [n, s = "", f = ""] = cells(l);
        return row(inline(n), inline(s), /^(yes|y|pick|true|\*)$/i.test(f) ? E.sig : E.t3, i === 0);
      }).join("")}</table>`;
    case "steps":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">${L.map((l, i) => {
        const done = /^\[x\]/i.test(l);
        return `<tr><td width="44" valign="top" style="${E.font}padding:8px 0;color:${E.sig};font-size:16px;font-weight:700">${done ? "✓" : i + 1}</td><td style="${E.font}padding:8px 0;color:${E.t1};font-size:18px;font-weight:600">${inline(l.replace(/^\[[ x]\]\s*/i, ""))}</td></tr>`;
      }).join("")}</table>`;
    case "prompt": {
      const body = L.filter((l) => !/^(label:|you get\b|result:)/i.test(l)).join(" ");
      const result = L.find((l) => /^(you get\b|result:)/i.test(l))?.replace(/^result:\s*/i, "") || "";
      const text = /^["“]/.test(body) ? body : `“${body}”`;
      return `<div style="margin:28px 0;padding-top:20px;border-top:1px solid ${E.div}"><p style="${E.font}margin:0;color:${E.t3};font-size:14px;font-weight:600">Copy this prompt</p><p style="${E.font}margin:12px 0 0;color:${E.t1};font-size:20px;line-height:1.42;font-weight:500">${fills(inline(curly(text)), ctx)}</p>${result ? `<p style="${E.font}margin:16px 0 0;color:${E.sig};font-size:16px;font-weight:600">${inline(result)}</p>` : ""}</div>`;
    }
    case "stat": {
      const [v = "", h = "", l = ""] = L;
      return `<div style="margin:28px 0"><p style="${E.font}margin:0;color:#A9D2FF;font-size:72px;line-height:1;font-weight:800;letter-spacing:-0.05em">${esc(v)}</p>${h ? `<p style="${E.font}margin:8px 0 0;color:${E.t1};font-size:28px;font-weight:700;letter-spacing:-0.03em">${inline(h)}</p>` : ""}${l ? `<p style="${E.font}margin:10px 0 0;color:${E.t2};font-size:17px;line-height:1.5">${inline(l)}</p>` : ""}</div>`;
    }
    case "meter":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">${L.map((l, i) => {
        const [label, value = ""] = cells(l);
        return row(`<span style="color:${E.t3};font-size:15px;font-weight:500">${inline(label)}</span>`, inline(value), E.sig, i === 0);
      }).join("")}</table>`;
    case "versus": {
      const [names = "A | B", ...rest] = L;
      const [a, b = ""] = cells(names);
      let verdict = "";
      const rs = rest.filter((l) => (/^verdict:/i.test(l) ? ((verdict = l.replace(/^verdict:\s*/i, "")), false) : true));
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="${E.font}color:${E.t1};font-size:20px;font-weight:700;padding-bottom:12px">${inline(a)}</td><td></td><td align="right" style="${E.font}color:${E.t1};font-size:20px;font-weight:700;padding-bottom:12px">${inline(b)}</td></tr>${rs
        .map((l) => {
          const [c, va = "", vb = "", w = ""] = cells(l);
          const td = `${E.font}padding:12px 0;border-top:1px solid ${E.div};font-size:16px;font-weight:600;`;
          return `<tr><td style="${td}color:${w.toLowerCase() === "a" ? E.sig : E.t2}">${inline(va)}</td><td align="center" style="${td}color:${E.t3};font-weight:500;font-size:14px">${inline(c)}</td><td align="right" style="${td}color:${w.toLowerCase() === "b" ? E.sig : E.t2}">${inline(vb)}</td></tr>`;
        })
        .join("")}${verdict ? `<tr><td colspan="3" align="center" style="${E.font}padding-top:16px;border-top:1px solid ${E.div};color:${E.sig};font-size:17px;font-weight:600">${inline(verdict)}</td></tr>` : ""}</table>`;
    }
    case "flip": {
      const get = (k: string) => (L.find((l) => l.toLowerCase().startsWith(k + ":")) || "").slice(k.length + 1).trim();
      return `<div style="margin:24px 0"><p style="${E.font}margin:0;color:${E.sig};font-size:14px;font-weight:600">${esc(get("kicker") || "Myth")}</p><p style="${E.font}margin:6px 0 0;color:${E.t3};font-size:22px;font-weight:700;text-decoration:line-through">${inline(get("myth") || get("mistake"))}</p><p style="${E.font}margin:16px 0 0;color:#A9D2FF;font-size:22px;font-weight:700">${inline(get("fact") || get("fix"))}</p>${get("proof") ? `<p style="${E.font}margin:8px 0 0;color:${E.t2};font-size:16px">${inline(get("proof"))}</p>` : ""}</div>`;
    }
    case "art":
    case "numeral":
      return "";
    default:
      return `<pre style="margin:20px 0;padding-top:16px;border-top:1px solid ${E.div};color:${E.t1};font-family:Menlo,Consolas,monospace;font-size:14px;line-height:1.5;white-space:pre-wrap">${esc(tok.text)}</pre>`;
  }
}

function emailToken(tok: Token, ctx: Ctx, inline: (s: string) => string, prev: Token | undefined): string {
  switch (tok.type) {
    case "heading": {
      const t = tok as Tokens.Heading;
      if (t.depth >= 4) return `<p style="${E.font}margin:0 0 10px;color:${E.sig};font-size:15px;font-weight:600">${inline(t.text)}</p>`;
      if (t.depth === 3) return `<h3 style="${E.font}margin:24px 0 0;color:${E.t1};font-size:24px;line-height:1.15;font-weight:700;letter-spacing:-0.03em">${inline(t.text)}</h3>`;
      const h = headline(t.text, inline);
      return `<h2 style="${E.font}margin:0;color:${E.t1};font-size:34px;line-height:1.06;font-weight:700;letter-spacing:-0.04em">${h.first}${h.second ? `<br><span style="color:${h.grad ? "#A9D2FF" : E.sec}">${h.second}</span>` : ""}</h2>`;
    }
    case "paragraph": {
      const lead = prev?.type === "heading" && (prev as Tokens.Heading).depth <= 2;
      return `<p style="${E.font}margin:${lead ? "16px" : "18px"} 0 0;color:${E.t2};font-size:${lead ? 19 : 17}px;line-height:1.6;font-weight:${lead ? 500 : 400}">${inline((tok as Tokens.Paragraph).text)}</p>`;
    }
    case "list": {
      const t = tok as Tokens.List;
      const tag = t.ordered ? "ol" : "ul";
      return `<${tag} style="${E.font}margin:18px 0 0;padding-left:22px;color:${E.t2};font-size:17px;line-height:1.6">${t.items.map((i) => `<li style="margin:6px 0">${inline(i.text.replace(/\n+/g, " "))}</li>`).join("")}</${tag}>`;
    }
    case "blockquote":
      return `<p style="${E.font}margin:20px 0 0;padding-left:16px;border-left:2px solid ${E.sig};color:${E.t2};font-size:19px;line-height:1.5;font-weight:500">${inline((tok as Tokens.Blockquote).text.replace(/\n+/g, " "))}</p>`;
    case "code":
      return emailFence(tok as Tokens.Code, ctx, inline);
    case "table": {
      const t = tok as Tokens.Table;
      const td = `${E.font}padding:10px 8px 10px 0;border-top:1px solid ${E.div};font-size:15px;text-align:left;`;
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>${t.header.map((c) => `<th style="${td}color:${E.t3};font-weight:600">${inline(c.text)}</th>`).join("")}</tr>${t.rows.map((r) => `<tr>${r.map((c) => `<td style="${td}color:${E.t2}">${inline(c.text)}</td>`).join("")}</tr>`).join("")}</table>`;
    }
    case "html":
      return `<p style="${E.font}color:${E.t2}">${esc((tok as Tokens.HTML).text)}</p>`;
    case "space":
    case "hr":
      return "";
    default:
      return "text" in tok && typeof tok.text === "string" ? `<p style="${E.font}margin:18px 0 0;color:${E.t2};font-size:17px;line-height:1.6">${inline(tok.text)}</p>` : "";
  }
}

// ---------- sections
type Section = { center: boolean; src: string };

export function splitSections(md: string): Section[] {
  const out: Section[] = [];
  let cur: string[] = [];
  let fence = false;
  const push = () => {
    const src = cur.join("\n").trim();
    if (src) {
      const center = /^@center\b/.test(src);
      out.push({ center, src: center ? src.replace(/^@center\b\s*/, "") : src });
    }
    cur = [];
  };
  for (const line of md.replace(/\r\n?/g, "\n").split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence && /^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      push();
      continue;
    }
    cur.push(line);
  }
  push();
  return out;
}

function renderSection(src: string, ctx: Ctx): string {
  const inline = inlineMarked(ctx);
  const lexer = new Marked({ gfm: true });
  const toks = lexer.lexer(src).filter((t) => t.type !== "space");
  if (ctx.target === "web") return toks.map((t) => webToken(t, ctx, inline)).join("");
  return toks.map((t, i) => emailToken(t, ctx, inline, toks[i - 1])).join("");
}

/** Article body for the web: one reading column, a hairline between sections. */
export function renderWeb(md: string, palette = "lagoon"): string {
  const ctx: Ctx = { target: "web", palette, base: "" };
  return splitSections(md)
    .map((sec) => renderSection(sec.src, ctx))
    .join('<hr class="ar-hr">');
}

/** Article body for email: inline styles, hairlines between sections. */
export function renderEmail(md: string, base: string, palette = "lagoon"): string {
  const ctx: Ctx = { target: "email", palette, base };
  return splitSections(md)
    .map((s) => `<div style="padding:36px 0;border-top:1px solid ${E.div}">${renderSection(s.src, ctx)}</div>`)
    .join("");
}

/** Plain-text version for email clients that need it. */
export function renderText(md: string): string {
  return splitSections(md)
    .map((s) =>
      s.src
        .replace(/^```\w*\n?|```$/gm, "")
        .replace(/^#{1,6}\s*/gm, "")
        .replace(/ \/ \*?([^*\n]+)\*?$/gm, "\n$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
        .replace(/ \| /g, " · ")
        .trim(),
    )
    .join("\n\n* * *\n\n");
}

/** Plain text for excerpts and search snippets. */
export function plain(md: string, max = 180): string {
  const t = renderText(md).replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : t;
}
