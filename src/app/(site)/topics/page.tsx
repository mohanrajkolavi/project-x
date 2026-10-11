import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site";
import { topics } from "@/lib/posts";

export const metadata: Metadata = { title: "Topics", alternates: { canonical: "/topics" } };

export default function TopicsPage() {
  const tags = topics();
  return (
    <PageShell palette="aurora" hero="mint">
      <div className="nl-wrap nl-page-head">
        <p className="nl-kicker">Topics</p>
        <h1 className="nl-h1">Browse by topic.</h1>
        <p className="nl-lead">Every issue is filed under the topics it covers.</p>
      </div>
      <div className="nl-wrap">
        {tags.length ? (
          <ul className="nl-list" style={{ maxWidth: 760 }}>
            {tags.map((t) => (
              <li key={t.slug}>
                <Link className="nl-row" href={`/topics/${t.slug}`}>
                  <h2 className="nl-row__title">{t.name}</h2>
                  <span className="nl-row__aside">
                    {t.count} {t.count === 1 ? "issue" : "issues"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="nl-lead">No topics yet. They appear as issues go out.</p>
        )}
      </div>
    </PageShell>
  );
}
