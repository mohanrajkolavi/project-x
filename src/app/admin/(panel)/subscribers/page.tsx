import type { Metadata } from "next";
import Link from "next/link";
import { listSubscribers, subscriberCounts } from "@/lib/subscribers";
import { shortDate } from "@/lib/format";
import { ConfirmButton, StateForm, Submit } from "@/components/admin/forms";
import { addSubscriber, importList, subscriberAction } from "../../actions";

export const metadata: Metadata = { title: "Subscribers" };

const PER = 50;
const TABS = [
  { key: "", label: "All", count: "all" },
  { key: "active", label: "Active", count: "active" },
  { key: "pending", label: "Waiting to confirm", count: "pending" },
  { key: "unsubscribed", label: "Unsubscribed", count: "unsubscribed" },
] as const;

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q || "").trim().slice(0, 100);
  const status = TABS.find((t) => t.key === sp.status)?.key || "";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const counts = subscriberCounts();
  const { total, rows } = listSubscribers({ q, status, limit: PER, offset: (page - 1) * PER });
  const pages = Math.max(1, Math.ceil(total / PER));
  const qs = (o: Record<string, string | number>) => {
    const p = new URLSearchParams();
    const all = { q, status, ...o };
    for (const [k, v] of Object.entries(all)) if (v) p.set(k, String(v));
    return `/admin/subscribers${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <div className="ad-head">
        <div>
          <p className="kicker ck-kicker">Audience</p>
          <h1 className="ad-title">Subscribers.</h1>
          <p className="ad-sub">Everyone who joined the free newsletter. Only active subscribers get sends.</p>
        </div>
        <div className="ad-head__actions">
          <a className="ad-btn" href={`/admin/export${status ? `?status=${status}` : ""}`}>
            Export CSV
          </a>
        </div>
      </div>

      <nav className="ad-tabs" aria-label="Filter">
        {TABS.map((t) => (
          <Link key={t.key} href={qs({ status: t.key, page: "" })} aria-current={t.key === status ? "true" : undefined}>
            {t.label} <span>{counts[t.count].toLocaleString("en-US")}</span>
          </Link>
        ))}
      </nav>

      <form className="ck-search" role="search" action="/admin/subscribers" style={{ marginTop: 0, marginBottom: 32 }}>
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <label className="sr-only" htmlFor="q">
          Search by email
        </label>
        <input id="q" name="q" type="search" defaultValue={q} placeholder="Search by email" />
        <button type="submit">Search</button>
      </form>

      {rows.length ? (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th>From</th>
                <th className="actions">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="main wrap">{s.email}</td>
                  <td>
                    <span className={`ad-status is-${s.status}`}>{s.status === "pending" ? "Waiting" : s.status === "active" ? "Active" : "Unsubscribed"}</span>
                  </td>
                  <td>{shortDate(s.created_at)}</td>
                  <td className="ad-muted">{s.source || "–"}</td>
                  <td className="actions">
                    {s.status !== "active" ? (
                      <form action={subscriberAction} className="ad-inline-form">
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="op" value="activate" />
                        <button className="ad-btn ad-btn--small ad-btn--text" type="submit">
                          Activate
                        </button>
                      </form>
                    ) : (
                      <ConfirmButton action={subscriberAction} fields={{ id: s.id, op: "unsubscribe" }} label="Unsubscribe" question={`Unsubscribe ${s.email}?`} danger={false} text />
                    )}
                    <ConfirmButton action={subscriberAction} fields={{ id: s.id, op: "delete" }} label="Delete" question={`Delete ${s.email} for good? Their send history goes too.`} text />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="ad-empty">
          <p className="lead">{q || status ? "No one matches." : "No subscribers yet. The signup form is at the end of every page."}</p>
        </div>
      )}
      {pages > 1 ? (
        <div className="ad-pager">
          {page > 1 ? (
            <Link className="ad-btn ad-btn--small" href={qs({ page: page - 1 })}>
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link className="ad-btn ad-btn--small" href={qs({ page: page + 1 })}>
              Next
            </Link>
          ) : (
            <span />
          )}
        </div>
      ) : null}

      <div className="ad-grid-2 ad-section">
        <section>
          <div className="ad-section__head">
            <h2>Add one</h2>
          </div>
          <StateForm action={addSubscriber} resetOnSuccess>
            <div className="ad-field">
              <label htmlFor="add-email">Email</label>
              <input className="ad-input" id="add-email" name="email" type="email" required />
              <p className="ad-hint">Added as active, with no confirmation email. Only add people who asked to join.</p>
            </div>
            <div className="ad-form-actions">
              <Submit pendingText="Adding…">Add subscriber</Submit>
            </div>
          </StateForm>
        </section>
        <section>
          <div className="ad-section__head">
            <h2>Import</h2>
          </div>
          <StateForm action={importList} resetOnSuccess encType="multipart/form-data">
            <div className="ad-field">
              <label htmlFor="list">Paste addresses</label>
              <textarea className="ad-textarea" id="list" name="list" rows={4} placeholder="One per line, or commas between" />
            </div>
            <div className="ad-field">
              <label htmlFor="file">Or pick a CSV file</label>
              <input className="ad-input" id="file" name="file" type="file" accept=".csv,.txt,text/csv,text/plain" style={{ paddingTop: 13 }} />
              <p className="ad-hint">Every email address in the file is found, whatever the columns. People already on the list are skipped.</p>
            </div>
            <div className="ad-form-actions">
              <Submit pendingText="Importing…">Import</Submit>
            </div>
          </StateForm>
        </section>
      </div>
    </>
  );
}
