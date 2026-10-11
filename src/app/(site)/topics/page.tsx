import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site";
import { Head } from "@/components/caro";
import { getSettings } from "@/lib/settings";
import { topics } from "@/lib/posts";

export const metadata: Metadata = { title: "Topics", alternates: { canonical: "/topics" } };

export default function TopicsPage() {
  const s = getSettings();
  const tags = topics();
  return (
    <PageShell label="Topics" handle={s.handle} palette="aurora" hero="mint">
      <section className="ck-section ck-section--hero">
        <div className="ck-container ck-stack" data-ck-reveal>
          <p className="kicker ck-kicker ck-fade">Topics</p>
          <Head as="h1" size="display" first="Pick by the job." second="Start where you are." />
          <p className="lead ck-lead ck-fade">Every issue is filed under the topics it teaches. Pick one to see them all.</p>
          {tags.length ? (
            <ul className="ck-rows ck-rows--links ck-rows--ruled ck-fade">
              {tags.map((t) => (
                <li key={t.slug}>
                  <Link className="ck-row-link" href={`/topics/${t.slug}`}>
                    <span className="ck-row is-yes">
                      <span className="row-name ck-row__name">{t.name}</span>
                      <span className="result ck-row__status">
                        {t.count} {t.count === 1 ? "issue" : "issues"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="body ck-text ck-fade">No topics yet. They appear as issues go out.</p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
