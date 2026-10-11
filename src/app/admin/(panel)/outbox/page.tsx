import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { smtpReady } from "@/lib/email";
import { requireUser } from "@/lib/auth";
import { dateTime } from "@/lib/format";
import { ConfirmButton } from "@/components/admin/forms";
import { clearOutbox } from "../../actions";

export const metadata: Metadata = { title: "Outbox" };

type Row = { id: number; to_email: string; subject: string; kind: string; created_at: string };

export default async function OutboxPage() {
  const user = await requireUser();
  const rows = db().prepare("SELECT id, to_email, subject, kind, created_at FROM outbox ORDER BY id DESC LIMIT 200").all() as Row[];
  const total = (db().prepare("SELECT COUNT(*) n FROM outbox").get() as { n: number }).n;
  return (
    <>
      <div className="ad-head">
        <div>
          <p className="kicker ck-kicker">Email</p>
          <h1 className="ad-title">Outbox.</h1>
          <p className="ad-sub">With no mail server set, every email lands here instead. Open one to see it exactly as a reader would.</p>
        </div>
        {total && user.role === "owner" ? (
          <div className="ad-head__actions">
            <ConfirmButton action={clearOutbox} fields={{}} label="Clear outbox" question={`Delete all ${total} emails in the outbox?`} />
          </div>
        ) : null}
      </div>
      {smtpReady() ? (
        <p className="ad-note" style={{ marginBottom: 40 }}>
          <b>A mail server is set,</b> so new emails go straight out. Older ones stay here until you clear them.
        </p>
      ) : null}
      {rows.length ? (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>To</th>
                <th>Type</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="main">
                    <Link href={`/admin/outbox/${r.id}`}>{r.subject}</Link>
                  </td>
                  <td className="wrap">{r.to_email}</td>
                  <td>{r.kind[0].toUpperCase() + r.kind.slice(1)}</td>
                  <td>{dateTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {total > rows.length ? <p className="ad-hint" style={{ marginTop: 16 }}>Showing the newest 200 of {total.toLocaleString("en-US")}.</p> : null}
        </div>
      ) : (
        <div className="ad-empty">
          <p className="lead">The outbox is empty.</p>
        </div>
      )}
    </>
  );
}
