import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { campaignById, topLinks } from "@/lib/campaigns";
import { postById } from "@/lib/posts";
import { subscriberCounts } from "@/lib/subscribers";
import { issueEmail, smtpReady } from "@/lib/email";
import { requireUser } from "@/lib/auth";
import { dateTime, pct } from "@/lib/format";
import { ConfirmButton, StateForm, Submit } from "@/components/admin/forms";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { removeSend, saveSend, sendNow, sendTest } from "../../../actions";

export const metadata: Metadata = { title: "Send" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; started?: string }> };

export default async function SendPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const c = campaignById(parseInt(id, 10));
  if (!c) notFound();
  const post = c.post_id ? postById(c.post_id) : null;
  const active = subscriberCounts().active;
  const email = post ? issueEmail(post, { subject: c.subject, preheader: c.preheader }) : null;

  if (c.status !== "draft") {
    const links = topLinks(c.id);
    const done = c.sent + c.failed;
    return (
      <>
        {c.status === "sending" ? <AutoRefresh every={2000} /> : null}
        <div className="ad-head">
          <div>
            <p className="kicker ck-kicker">
              <Link href="/admin/sends" style={{ color: "inherit", textDecoration: "none" }}>
                Sends
              </Link>{" "}
              · Report
            </p>
            <h1 className="ad-title">{c.subject}</h1>
            <p className="ad-sub">
              {c.status === "sending" ? `Sending now · ${done} of ${c.recipients} done` : `Sent ${dateTime(c.sent_at)} to ${c.recipients.toLocaleString("en-US")} ${c.recipients === 1 ? "person" : "people"}`}
            </p>
          </div>
          {post ? (
            <div className="ad-head__actions">
              <Link className="ad-btn" href={`/admin/posts/${post.id}`}>
                Open the issue
              </Link>
            </div>
          ) : null}
        </div>
        {sp.started ? <p className="ad-flash" role="status">Sending started. This page updates on its own.</p> : null}
        {!smtpReady() ? (
          <p className="ad-note" style={{ marginBottom: 48 }}>
            <b>No mail server is set,</b> so these emails went to the <Link href="/admin/outbox">outbox</Link>, not to inboxes.
          </p>
        ) : null}
        <section className="ad-kpis">
          {[
            { label: "Delivered", v: c.sent, r: c.recipients ? c.sent / c.recipients : null },
            { label: "Opened", v: c.opened, r: c.sent ? c.opened / c.sent : null },
            { label: "Clicked", v: c.clicked, r: c.sent ? c.clicked / c.sent : null },
            { label: "Failed", v: c.failed, r: c.recipients ? c.failed / c.recipients : null },
          ].map((k) => (
            <div className="ad-kpi" key={k.label}>
              <p className="ad-kpi__label">{k.label}</p>
              <span className="ad-kpi__value ck-hero">{k.v.toLocaleString("en-US")}</span>
              <p className="ad-kpi__note">{pct(k.r)}</p>
            </div>
          ))}
        </section>
        <p className="ad-hint" style={{ marginTop: 24 }}>Opens are counted when images load, so the real number is often higher. A click also counts as an open.</p>
        <section className="ad-section">
          <div className="ad-section__head">
            <h2>Most clicked links</h2>
          </div>
          {links.length ? (
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Link</th>
                    <th className="num">People</th>
                    <th className="num">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((l) => (
                    <tr key={l.url}>
                      <td className="wrap">
                        <a className="ck-inline-link" href={l.url} target="_blank" rel="noopener noreferrer">
                          {l.url.replace(/^https?:\/\//, "")}
                        </a>
                      </td>
                      <td className="num">{l.people}</td>
                      <td className="num">{l.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="ad-hint">No clicks yet.</p>
          )}
        </section>
      </>
    );
  }

  return (
    <>
      <div className="ad-head">
        <div>
          <p className="kicker ck-kicker">
            <Link href="/admin/sends" style={{ color: "inherit", textDecoration: "none" }}>
              Sends
            </Link>{" "}
            · New
          </p>
          <h1 className="ad-title">Check it. Then send.</h1>
          <p className="ad-sub">{post ? `${post.title} ${post.title_sec}` : "The issue for this send was deleted."}</p>
        </div>
        <div className="ad-head__actions">
          <ConfirmButton action={removeSend} fields={{ id: c.id }} label="Discard" question="Discard this send? Nothing has gone out." />
        </div>
      </div>

      <div className="ad-editor">
        <div className="ad-form">
          <section>
            <div className="ad-section__head">
              <h2>1 · Subject</h2>
            </div>
            <StateForm action={saveSend}>
              <input type="hidden" name="id" value={c.id} />
              <div className="ad-field">
                <label htmlFor="subject">Subject line</label>
                <input className="ad-input" id="subject" name="subject" defaultValue={c.subject} maxLength={200} required />
              </div>
              <div className="ad-field">
                <label htmlFor="preheader">Preview text</label>
                <input className="ad-input" id="preheader" name="preheader" defaultValue={c.preheader} maxLength={200} />
                <p className="ad-hint">Shown next to the subject in most inboxes.</p>
              </div>
              <div className="ad-form-actions">
                <Submit pendingText="Saving…">Save</Submit>
              </div>
            </StateForm>
          </section>

          <section className="ad-fieldset" style={{ display: "block" }}>
            <div className="ad-section__head">
              <h2>2 · Test</h2>
            </div>
            <StateForm action={sendTest}>
              <input type="hidden" name="id" value={c.id} />
              <div className="ad-field">
                <label htmlFor="to">Send a test to</label>
                <input className="ad-input" id="to" name="to" type="email" defaultValue={user.email} />
              </div>
              <div className="ad-form-actions">
                <Submit pendingText="Sending…">Send test</Submit>
              </div>
            </StateForm>
          </section>

          <section className="ad-fieldset" style={{ display: "block" }}>
            <div className="ad-section__head">
              <h2>3 · Send</h2>
            </div>
            {sp.error === "confirm" ? <p className="ad-flash is-error" role="alert">Type “send” to confirm.</p> : null}
            {!smtpReady() ? (
              <p className="ad-note" style={{ marginBottom: 24 }}>
                <b>No mail server is set.</b> Emails will go to the outbox, not to inboxes.
              </p>
            ) : null}
            <form action={sendNow} className="ad-form">
              <input type="hidden" name="id" value={c.id} />
              <div className="ad-field">
                <label htmlFor="confirm">Type “send” to confirm</label>
                <input className="ad-input" id="confirm" name="confirm" autoComplete="off" pattern="send" required placeholder="send" />
                <p className="ad-hint">
                  Goes to {active.toLocaleString("en-US")} active {active === 1 ? "subscriber" : "subscribers"}. You can’t undo a send.
                </p>
              </div>
              <div className="ad-form-actions">
                <button className="ad-btn ad-btn--primary" type="submit" disabled={!post || active === 0}>
                  Send to {active.toLocaleString("en-US")}
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside className="ad-editor__side" aria-label="Email preview">
          <div className="ad-editor__side-head">
            <span>Email preview</span>
            <span>{c.subject}</span>
          </div>
          {email ? <iframe className="ad-frame" title="Email preview" srcDoc={email.html} sandbox="" style={{ borderRadius: 0, boxShadow: "none" }} /> : null}
        </aside>
      </div>
    </>
  );
}
