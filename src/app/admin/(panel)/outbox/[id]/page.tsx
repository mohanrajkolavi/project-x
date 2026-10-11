import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Outbox email" };

type Row = { id: number; to_email: string; subject: string; html: string; text: string; kind: string; created_at: string };

export default async function OutboxItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = db().prepare("SELECT * FROM outbox WHERE id = ?").get(parseInt(id, 10)) as Row | undefined;
  if (!m) notFound();
  const links = [...new Set([...m.html.matchAll(/href="([^"]+)"/g)].map((x) => x[1].replace(/&amp;/g, "&")))].filter((h) => h.includes("/subscribe/confirm") || h.includes("/unsubscribe"));
  return (
    <>
      <div className="ad-head">
        <div>
          <p className="kicker ck-kicker">
            <Link href="/admin/outbox" style={{ color: "inherit", textDecoration: "none" }}>
              Outbox
            </Link>{" "}
            · {m.kind}
          </p>
          <h1 className="ad-title">{m.subject}</h1>
          <p className="ad-sub">
            To {m.to_email} · {dateTime(m.created_at)}
          </p>
        </div>
      </div>
      {links.length ? (
        <p className="ad-note" style={{ marginBottom: 32 }}>
          <b>Testing by hand?</b> Open the link this reader would tap:{" "}
          {links.map((l) => (
            <a key={l} href={l} target="_blank" rel="noopener noreferrer" style={{ display: "block", overflowWrap: "anywhere" }}>
              {l}
            </a>
          ))}
        </p>
      ) : null}
      <iframe className="ad-frame" title="Email" srcDoc={m.html} sandbox="allow-popups allow-popups-to-escape-sandbox" />
      <details className="ad-details" style={{ marginTop: 24 }}>
        <summary>Plain-text version</summary>
        <pre>{m.text}</pre>
      </details>
    </>
  );
}
