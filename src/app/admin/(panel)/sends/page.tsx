import type { Metadata } from "next";
import Link from "next/link";
import { listCampaigns } from "@/lib/campaigns";
import { allPosts, postState } from "@/lib/posts";
import { subscriberCounts } from "@/lib/subscribers";
import { pct, shortDate } from "@/lib/format";
import { newSend } from "../../actions";

export const metadata: Metadata = { title: "Sends" };

export default async function SendsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const sends = listCampaigns();
  const posts = allPosts().filter((p) => postState(p) !== "Draft");
  const active = subscriberCounts().active;
  return (
    <>
      <div className="ad-head">
        <div>
          <p className="kicker ck-kicker">Email</p>
          <h1 className="ad-title">Sends.</h1>
          <p className="ad-sub">Send a published issue to every active subscriber. You’ll check a preview and a test first.</p>
        </div>
      </div>

      <section className="ad-section">
        <div className="ad-section__head">
          <h2>New send</h2>
          <span className="ad-muted" style={{ fontSize: 15, fontWeight: 600 }}>
            {active.toLocaleString("en-US")} active {active === 1 ? "subscriber" : "subscribers"}
          </span>
        </div>
        {sp.error === "pick" ? <p className="ad-flash is-error" role="alert">Pick an issue to send.</p> : null}
        {posts.length ? (
          <form action={newSend} className="ad-form ad-form--narrow">
            <div className="ad-field">
              <label htmlFor="post_id">Issue</label>
              <select className="ad-select" id="post_id" name="post_id" required>
                {posts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.title_sec} ({postState(p) === "Scheduled" ? "scheduled" : shortDate(p.published_at)})
                  </option>
                ))}
              </select>
            </div>
            <div className="ad-form-actions">
              <button className="ad-btn ad-btn--primary" type="submit">
                Continue
              </button>
            </div>
          </form>
        ) : (
          <div className="ad-empty">
            <p className="lead">Publish an issue first. Then you can send it.</p>
            <Link className="ad-btn" href="/admin/posts/new">
              Write an issue
            </Link>
          </div>
        )}
      </section>

      <section className="ad-section">
        <div className="ad-section__head">
          <h2>History</h2>
        </div>
        {sends.length ? (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Status</th>
                  <th className="num">Recipients</th>
                  <th className="num">Opened</th>
                  <th className="num">Clicked</th>
                </tr>
              </thead>
              <tbody>
                {sends.map((c) => (
                  <tr key={c.id}>
                    <td className="main">
                      <Link href={`/admin/sends/${c.id}`}>{c.subject}</Link>
                      <span className="sub">{c.status === "draft" ? `Created ${shortDate(c.created_at)}` : c.sent_at ? `Sent ${shortDate(c.sent_at)}` : "Sending now"}</span>
                    </td>
                    <td>
                      <span className={`ad-status is-${c.status}`}>{c.status === "draft" ? "Draft" : c.status === "sending" ? "Sending" : "Sent"}</span>
                    </td>
                    <td className="num">{c.status === "draft" ? "–" : c.recipients.toLocaleString("en-US")}</td>
                    <td className="num">{c.sent ? pct(c.opened / c.sent) : "–"}</td>
                    <td className="num">{c.sent ? pct(c.clicked / c.sent) : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="ad-hint">No sends yet.</p>
        )}
      </section>
    </>
  );
}
