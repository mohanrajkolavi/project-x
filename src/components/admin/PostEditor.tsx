"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { previewBody, removePost, savePost, type FormState } from "@/app/admin/actions";
import { ART, ART_MEANING, LABELS, PAIRINGS, type Post } from "@/lib/content";
import { loadCaro } from "@/components/CaroRuntime";
import { ConfirmButton, Flash, Submit } from "./forms";

const SNIPPETS: { label: string; text: string }[] = [
  { label: "Section", text: "\n\n---\n\n#### Kicker\n## First line. / Second line.\n\nLead sentence that explains the idea.\n" },
  { label: "Rows", text: "\n```rows\nFree plan | Yes | yes\nAPI | Coming later\n```\n" },
  { label: "Steps", text: "\n```steps\n[x] Open Settings, then Features\nTurn on the new option\nTry it on one task\n```\n" },
  { label: "Prompt", text: "\n```prompt\nSummarise this in [3] bullets for [my manager].\nYou get · a short, sendable summary\n```\n" },
  { label: "Stat", text: "\n```stat\n40%\ncheaper per task.\nWhat it measures and against what.\n```\n" },
  { label: "Meter", text: "\n```meter\nOutput price per 1M tokens | $20 | 40\nInput price per 1M tokens | $4 | 8\n```\n" },
  { label: "Versus", text: "\n```versus\nOption A | Option B\nPrice per 1M tokens | $4 / $20 | $10 / $50 | a\nBest for | Daily work | Hard tasks | none\nVerdict: Pick A for value, B for hard tasks.\n```\n" },
  { label: "Myth", text: "\n```flip\nKicker: Myth 1\nMyth: AI remembers everything you tell it.\nFact: Most chats start fresh unless memory is on.\nProof: Check Settings › Personalization › Memory.\n```\n" },
  { label: "Art", text: "\n```art\nbulb\n```\n" },
];

const HELP = `---                       new section (one idea each)
@center                   first line of a section: centre it
#### Kicker               small blue line above a headline
## First. / Second.        two-line headline, second line muted
## First. / *Second.*      second line in the hero finish (once per page)
A paragraph right after a headline becomes the lead.
**bold**, [link](https://…), - lists, 1. lists, > quote

\`\`\`rows      Name | Status | yes   (yes = blue)
\`\`\`steps     [x] done step, or plain step
\`\`\`prompt    text with [fill-ins], then "You get · …"
\`\`\`stat      value, headline, context (3 lines)
\`\`\`meter     Label | Value | percent of a shared max
\`\`\`versus    A | B, then Criterion | a | b | winner, Verdict: …
\`\`\`flip      Kicker:, Myth:, Fact:, Proof:
\`\`\`art       bulb (or any art name) and an optional width
\`\`\`numeral   5`;

function toLocalInput(sql: string | null): string {
  if (!sql) return "";
  const d = new Date(sql.replace(" ", "T") + "Z");
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

export function PostEditor({ post, defaultPairing = 0, justCreated = false }: { post: Post | null; defaultPairing?: number; justCreated?: boolean }) {
  const [state, run] = useActionState<FormState, FormData>(savePost, justCreated ? { ok: true, message: "Issue created." } : null);
  const formRef = useRef<HTMLFormElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const startPairing = post ? Math.max(0, PAIRINGS.findIndex((p) => p.palette === post.palette && p.hero === post.hero)) : defaultPairing;
  const [title, setTitle] = useState(post?.title ?? "");
  const [titleSec, setTitleSec] = useState(post?.title_sec ?? "");
  const [label, setLabel] = useState(post?.label ?? LABELS[0]);
  const [numeral, setNumeral] = useState(post?.numeral ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "#### Kicker\n## First line. / Second line.\n\nStart with what it is, in plain words.\n");
  const [art, setArt] = useState(post?.art ?? "bulb");
  const [pairing, setPairing] = useState(startPairing);
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [when, setWhen] = useState(toLocalInput(post?.published_at ?? null));
  const [html, setHtml] = useState("");
  const [dirty, setDirty] = useState(false);

  const pal = PAIRINGS[pairing] ?? PAIRINGS[0];
  const whenUtc = useMemo(() => {
    if (!when) return "";
    const d = new Date(when);
    return isNaN(d.getTime()) ? "" : d.toISOString();
  }, [when]);
  const scheduled = status === "published" && !!whenUtc && new Date(whenUtc).getTime() > Date.now();

  // Live preview, debounced.
  useEffect(() => {
    const t = setTimeout(() => {
      previewBody(body, pal.palette).then(setHtml).catch(() => {});
    }, 350);
    return () => clearTimeout(t);
  }, [body, pal.palette]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    loadCaro().then((Caro) => {
      const api = Caro as unknown as { mount: (r: ParentNode) => void; copy: (r: ParentNode) => void };
      api.mount(el);
      api.copy(el);
      el.querySelectorAll("[data-ck-flip]").forEach((f) => f.classList.add("is-flipped"));
      el.querySelectorAll("[data-ck-orbits]").forEach((n) => {
        if (!n.querySelector(".ck-orbits")) Caro.orbits(n, { k: 0.7 });
      });
    });
  }, [html, numeral]);

  // Save with Cmd/Ctrl+S; warn before leaving with unsaved changes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [dirty]);
  useEffect(() => {
    if (state?.ok) setDirty(false);
  }, [state]);

  const insert = (text: string) => {
    const ta = bodyRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const next = body.slice(0, s) + text + body.slice(e);
    setBody(next);
    setDirty(true);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = s + text.length;
    });
  };

  const live = post && post.status === "published" && post.published_at && new Date(post.published_at.replace(" ", "T") + "Z").getTime() <= Date.now();
  const n = numeral.trim();

  return (
    <>
      <div className="ad-head">
        <div>
          <p className="kicker ck-kicker">
            <Link href="/admin/posts" style={{ color: "inherit", textDecoration: "none" }}>
              Issues
            </Link>{" "}
            · {post ? "Edit" : "New"}
          </p>
          <h1 className="ad-title">{post ? "Edit the issue." : "Write an issue."}</h1>
        </div>
        <div className="ad-head__actions">
          {live ? (
            <Link className="ad-btn" href={`/issues/${post!.slug}`} target="_blank">
              View live
            </Link>
          ) : null}
          {post ? <ConfirmButton action={removePost} fields={{ id: post.id }} label="Delete" question={`Delete “${post.title}”? This can’t be undone.`} /> : null}
        </div>
      </div>

      <form ref={formRef} action={run} className="ad-editor" onChange={() => setDirty(true)}>
        <div className="ad-form">
          <Flash state={state} />
          {post ? <input type="hidden" name="id" value={post.id} /> : null}

          <div className="ad-row-2">
            <div className="ad-field">
              <label htmlFor="title">Headline, first line</label>
              <input className="ad-input" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="5 Claude upgrades you missed." required maxLength={160} />
            </div>
            <div className="ad-field">
              <label htmlFor="title_sec">Second line (muted)</label>
              <input className="ad-input" id="title_sec" name="title_sec" value={titleSec} onChange={(e) => setTitleSec(e.target.value)} placeholder="Three are free." maxLength={160} />
            </div>
          </div>
          <p className="ad-hint" style={{ marginTop: -12 }}>Sentence case. End each line with “.” or “?”. No em dashes.</p>

          <div className="ad-field">
            <label htmlFor="excerpt">Lead</label>
            <textarea className="ad-textarea" id="excerpt" name="excerpt" rows={3} style={{ minHeight: 96 }} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={400} placeholder="One or two short sentences. Used on the page, in lists, in search results and as the email preview." />
          </div>

          <div className="ad-row-3">
            <div className="ad-field">
              <label htmlFor="label">Post type</label>
              <input className="ad-input" id="label" name="label" list="labels" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={16} />
              <datalist id="labels">
                {LABELS.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </div>
            <div className="ad-field">
              <label htmlFor="numeral">Hero number</label>
              <input className="ad-input" id="numeral" name="numeral" value={numeral} onChange={(e) => setNumeral(e.target.value)} maxLength={4} placeholder="Optional, like 5" />
            </div>
            <div className="ad-field">
              <label htmlFor="tags">Topics</label>
              <input className="ad-input" id="tags" name="tags" defaultValue={post?.tags ?? ""} placeholder="Prompts, Email" />
            </div>
          </div>

          <div className="ad-field">
            <span className="ad-label" id="body-label">
              Body
            </span>
            <div className="ad-toolbar" role="toolbar" aria-label="Insert a block">
              {SNIPPETS.map((s) => (
                <button key={s.label} type="button" onClick={() => insert(s.text)}>
                  + {s.label}
                </button>
              ))}
            </div>
            <textarea
              ref={bodyRef}
              className="ad-textarea ad-textarea--code"
              name="body"
              aria-labelledby="body-label"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              spellCheck
            />
            <details className="ad-details">
              <summary>How to write blocks</summary>
              <pre>{HELP}</pre>
            </details>
          </div>

          <fieldset className="ad-fieldset">
            <legend>Look</legend>
            <div className="ad-field">
              <span className="ad-label">Palette and hero finish</span>
              <div className="ad-choices" role="radiogroup" aria-label="Palette and hero finish">
                {PAIRINGS.map((p, i) => (
                  <label key={p.name} className={`ad-choice pal-${p.palette} hero-${p.hero}`}>
                    <input type="radio" name="pairing" value={i} checked={pairing === i} onChange={() => setPairing(i)} />
                    <span className="ad-swatch-hero ck-hero">Aa</span>
                    <span className="ad-swatch" />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
              <p className="ad-hint">Give neighbouring issues different pairs.</p>
            </div>
            <div className="ad-field">
              <span className="ad-label">Art {n ? "(hidden while a hero number is set)" : ""}</span>
              <div className="ad-choices" role="radiogroup" aria-label="Art">
                {ART.filter((a) => a !== "orbits").map((a) => (
                  <label key={a} className="ad-choice" title={ART_MEANING[a]}>
                    <input type="radio" name="art" value={a} checked={art === a} onChange={() => setArt(a)} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/art/${a}.svg${pal.palette !== "lagoon" ? `?pal=${pal.palette}` : ""}`} alt="" loading="lazy" />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
              <p className="ad-hint">{ART_MEANING[art]}.</p>
            </div>
          </fieldset>

          <fieldset className="ad-fieldset">
            <legend>Publish</legend>
            <div className="ad-row-2">
              <div className="ad-field">
                <span className="ad-label">Status</span>
                <label className="ad-check">
                  <input type="radio" name="status" value="draft" checked={status === "draft"} onChange={() => setStatus("draft")} />
                  <span>
                    <b>Draft.</b> Only the team can see it.
                  </span>
                </label>
                <label className="ad-check">
                  <input type="radio" name="status" value="published" checked={status === "published"} onChange={() => setStatus("published")} />
                  <span>
                    <b>Publish.</b> Live now, or at the date below.
                  </span>
                </label>
              </div>
              <div className="ad-field">
                <label htmlFor="when">Publish date (your time)</label>
                <input className="ad-input" id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
                <input type="hidden" name="published_at_utc" value={whenUtc} />
                <p className="ad-hint">{scheduled ? "Scheduled. It goes live on its own at this time." : "Leave empty to use the moment you publish."}</p>
              </div>
            </div>
            <div className="ad-field">
              <label htmlFor="slug">Web address</label>
              <input className="ad-input" id="slug" name="slug" defaultValue={post?.slug ?? ""} placeholder="Made from the headline" />
              <p className="ad-hint">/issues/{post?.slug || "your-headline"}</p>
            </div>
          </fieldset>

          <div className="ad-form-actions">
            <Submit primary pendingText="Saving…">
              {status === "draft" ? "Save draft" : scheduled ? "Schedule" : live ? "Update" : "Publish"}
            </Submit>
            <span className="ad-hint">{dirty ? "Unsaved changes · ⌘S saves" : "All changes saved"}</span>
          </div>
        </div>

        <aside className="ad-editor__side" aria-label="Preview">
          <div className="ad-editor__side-head">
            <span>Preview</span>
            <span>{pal.name}</span>
          </div>
          <div className={`ck-root ad-preview pal-${pal.palette} hero-${pal.hero}`} ref={previewRef}>
            <section className="ck-section">
              <div className="ck-container ck-stack ck-stack--center">
                <p className="kicker ck-kicker">{label || "Post type"} · Preview</p>
                {n ? (
                  <div className="ck-numeral" data-ck-orbits key={n}>
                    <span className={`${n.length <= 2 ? "hero-xl" : "hero"} ck-hero`}>{n}</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="ck-art ck-art-float" src={`/art/${art}.svg${pal.palette !== "lagoon" ? `?pal=${pal.palette}` : ""}`} alt="" width={300} style={{ marginBottom: 24 }} />
                )}
                <h2 className="display ck-head">
                  {title || "Your headline."}
                  {titleSec ? (
                    <>
                      <br />
                      <span className="ck-sec">{titleSec}</span>
                    </>
                  ) : null}
                </h2>
                {excerpt ? <p className="lead ck-lead">{excerpt}</p> : null}
              </div>
            </section>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </aside>
      </form>
    </>
  );
}
