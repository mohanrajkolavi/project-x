import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { allPosts, postState } from "@/lib/posts";
import { subscriberCounts, listSubscribers } from "@/lib/subscribers";
import {
  audienceSeries, emailRates, lostSubscribers, newSubscribers, signupSources, topPosts, topReferrers, totals, viewsSeries,
} from "@/lib/analytics";
import { listCampaigns } from "@/lib/campaigns";
import { smtpReady } from "@/lib/email";
import { compact, pct, shortDate } from "@/lib/format";
import { TimeChart } from "@/components/admin/Chart";
import { Icon } from "@/components/caro";

const RANGES = [7, 30, 90] as const;

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const range = (RANGES as readonly number[]).includes(Number(sp.range)) ? Number(sp.range) : 30;
  const counts = subscriberCounts();
  const joined = newSubscribers(range);
  const left = lostSubscribers(range);
  const t = totals(range);
  const rates = emailRates(5);
  const audience = audienceSeries(range);
  const traffic = viewsSeries(range);
  const top = topPosts(range);
  const refs = topReferrers(range);
  const sources = signupSources();
  const recent = listSubscribers({ limit: 5, offset: 0, status: "active" }).rows;
  const lastSend = listCampaigns().find((c) => c.status !== "draft");
  const drafts = allPosts().filter((p) => postState(p) !== "Published").slice(0, 4);
  const hour = new Date().getUTCHours();

  return (
    <>
      <div className="ad-head">
        <div>
          <p className="kicker ck-kicker">Dashboard</p>
          <h1 className="ad-title">
            {hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}, {user.name.split(" ")[0]}.
          </h1>
        </div>
        <div className="ad-head__actions">
          <Link className="ad-btn" href="/admin/sends">
            New send
          </Link>
          <Link className="ad-btn ad-btn--primary" href="/admin/posts/new">
            Write an issue
          </Link>
        </div>
      </div>

      {!smtpReady() ? (
        <p className="ad-note" style={{ marginBottom: 48 }}>
          <b>No mail server yet.</b> Confirmations and issues are kept in the <Link href="/admin/outbox">outbox</Link> instead of being sent.{" "}
          {user.role === "owner" ? <Link href="/admin/settings#mail">Add one in settings.</Link> : "Ask the owner to add one."}
        </p>
      ) : null}

      <nav className="ad-tabs" aria-label="Date range">
        {RANGES.map((r) => (
          <Link key={r} href={`/admin?range=${r}`} aria-current={r === range ? "true" : undefined}>
            Last {r} days
          </Link>
        ))}
      </nav>

      <section className="ad-kpis" aria-label="Key numbers">
        <div className="ad-kpi">
          <p className="ad-kpi__label">Active subscribers</p>
          <span className="ad-kpi__value ck-hero">{compact(counts.active)}</span>
          <p className="ad-kpi__note">
            <span className="is-up">+{joined}</span> joined · {left} left
          </p>
        </div>
        <div className="ad-kpi">
          <p className="ad-kpi__label">Page views</p>
          <span className="ad-kpi__value ck-hero">{compact(t.views)}</span>
          <p className="ad-kpi__note">{compact(t.visitors)} visits</p>
        </div>
        <div className="ad-kpi">
          <p className="ad-kpi__label">Open rate</p>
          <span className={`ad-kpi__value ${rates.openRate == null ? "is-quiet" : "ck-hero"}`}>{pct(rates.openRate)}</span>
          <p className="ad-kpi__note">{rates.sends === 1 ? "Last send" : `Last ${rates.sends || 5} sends`}</p>
        </div>
        <div className="ad-kpi">
          <p className="ad-kpi__label">Click rate</p>
          <span className={`ad-kpi__value ${rates.clickRate == null ? "is-quiet" : "ck-hero"}`}>{pct(rates.clickRate)}</span>
          <p className="ad-kpi__note">Of delivered emails</p>
        </div>
      </section>

      <div className="ad-grid-2" style={{ marginTop: 80 }}>
        <section className="ad-section">
          <div className="ad-section__head">
            <h2>Audience</h2>
            <span className="ad-muted" style={{ fontSize: 15, fontWeight: 600 }}>
              Active subscribers each day
            </span>
          </div>
          <TimeChart data={audience} kind="line" unit="subscribers" />
        </section>
        <section className="ad-section">
          <div className="ad-section__head">
            <h2>Traffic</h2>
            <span className="ad-muted" style={{ fontSize: 15, fontWeight: 600 }}>
              Views and visitors each day
            </span>
          </div>
          <TimeChart data={traffic.views} kind="bars" unit="views" extra={{ name: "visitors", data: traffic.visitors }} />
        </section>
      </div>

      <div className="ad-grid-2 ad-section">
        <section>
          <div className="ad-section__head">
            <h2>Top issues</h2>
            <span className="ad-muted" style={{ fontSize: 15, fontWeight: 600 }}>
              Views, last {range} days
            </span>
          </div>
          {top.length ? (
            <ul className="ad-rows">
              {top.map((p) => (
                <li key={p.id}>
                  <span className="name">
                    <Link href={`/admin/posts/${p.id}`}>{p.title}</Link>
                  </span>
                  <span className="val is-yes">{p.views.toLocaleString("en-US")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ad-hint">No views yet. They show up as people read.</p>
          )}
        </section>
        <section>
          <div className="ad-section__head">
            <h2>Where readers come from</h2>
          </div>
          {refs.length ? (
            <ul className="ad-rows">
              {refs.map((r) => (
                <li key={r.name}>
                  <span className="name">{r.name}</span>
                  <span className="val">{r.views.toLocaleString("en-US")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ad-hint">No visits yet.</p>
          )}
        </section>
      </div>

      <div className="ad-grid-2 ad-section">
        <section>
          <div className="ad-section__head">
            <h2>Last send</h2>
            {lastSend ? <Link className="ck-link" href={`/admin/sends/${lastSend.id}`}>Open report <Icon name="arrow" /></Link> : null}
          </div>
          {lastSend ? (
            <>
              <p className="ad-sub" style={{ marginTop: 0, color: "var(--t1)", fontWeight: 600 }}>
                {lastSend.subject}
              </p>
              <p className="ad-hint" style={{ marginTop: 6 }}>
                {lastSend.status === "sending" ? "Sending now" : `Sent ${shortDate(lastSend.sent_at)}`} · {lastSend.recipients.toLocaleString("en-US")} recipients
              </p>
              <div className="ad-meters" style={{ marginTop: 28 }}>
                {[
                  { name: "Delivered", v: lastSend.sent, of: lastSend.recipients },
                  { name: "Opened", v: lastSend.opened, of: lastSend.sent },
                  { name: "Clicked", v: lastSend.clicked, of: lastSend.sent },
                ].map((m) => {
                  const r = m.of ? m.v / m.of : 0;
                  return (
                    <div key={m.name} className="ck-meter" style={{ ["--v" as string]: `${Math.round(r * 100)}%` }}>
                      <div className="ck-meter__top">
                        <span className="fine ck-meter__label">
                          {m.name} · {m.v.toLocaleString("en-US")} of {m.of.toLocaleString("en-US")}
                        </span>
                        <span className="result ck-meter__value">{pct(m.of ? r : 0)}</span>
                      </div>
                      <div className="ck-meter__track">
                        <div className="ck-meter__fill" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="ad-empty" style={{ padding: "32px 0" }}>
              <p className="lead">No sends yet.</p>
              <Link className="ad-btn" href="/admin/sends">
                Send an issue
              </Link>
            </div>
          )}
        </section>
        <section>
          <div className="ad-section__head">
            <h2>Signups by page</h2>
          </div>
          {sources.length ? (
            <ul className="ad-rows">
              {sources.map((s) => (
                <li key={s.name}>
                  <span className="name">{s.name}</span>
                  <span className="val">{s.n.toLocaleString("en-US")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ad-hint">No subscribers yet.</p>
          )}
        </section>
      </div>

      <div className="ad-grid-2 ad-section">
        <section>
          <div className="ad-section__head">
            <h2>Newest subscribers</h2>
            <Link className="ck-link" href="/admin/subscribers">
              All <Icon name="arrow" />
            </Link>
          </div>
          {recent.length ? (
            <ul className="ad-rows">
              {recent.map((s) => (
                <li key={s.id}>
                  <span className="name">{s.email}</span>
                  <span className="val">{shortDate(s.confirmed_at || s.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ad-hint">Nobody yet. Share the site to get your first readers.</p>
          )}
        </section>
        <section>
          <div className="ad-section__head">
            <h2>Drafts and scheduled</h2>
            <Link className="ck-link" href="/admin/posts">
              All issues <Icon name="arrow" />
            </Link>
          </div>
          {drafts.length ? (
            <ul className="ad-rows">
              {drafts.map((p) => (
                <li key={p.id}>
                  <span className="name">
                    <Link href={`/admin/posts/${p.id}`}>{p.title}</Link>
                  </span>
                  <span className={`ad-status is-${postState(p).toLowerCase()}`}>{postState(p)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ad-hint">Nothing waiting. Every issue is live.</p>
          )}
        </section>
      </div>
    </>
  );
}
