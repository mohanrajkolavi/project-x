import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site";
import { Head, Icon } from "@/components/caro";
import { IssueList } from "@/components/issues";
import { getSettings } from "@/lib/settings";
import { livePosts, topics, type Post } from "@/lib/posts";
import { monthKey } from "@/lib/format";

export const metadata: Metadata = { title: "Issues", alternates: { canonical: "/issues" } };

const PER_PAGE = 24;

export default async function IssuesPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q || "").trim().slice(0, 80);
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const s = getSettings();
  const all = livePosts({ q: q || undefined });
  const posts = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const tags = topics();

  const groups: { month: string; posts: Post[] }[] = [];
  for (const p of posts) {
    const m = monthKey(p.published_at);
    if (groups.at(-1)?.month !== m) groups.push({ month: m, posts: [] });
    groups.at(-1)!.posts.push(p);
  }
  const total = all.length;
  const showNumeral = !q && total > 0 && String(total).length <= 4;

  return (
    <PageShell label="Issues" handle={s.handle} palette="electric" hero="titanium">
      <section className="ck-section ck-section--hero">
        <div className="ck-container ck-stack" data-ck-reveal>
          <p className="kicker ck-kicker ck-fade">The archive</p>
          {showNumeral ? (
            <div className="ck-numeral" data-ck-orbits style={{ marginTop: 0 }}>
              <span className={`${String(total).length <= 2 ? "hero-xl" : "hero"} ck-hero`}>{total}</span>
            </div>
          ) : null}
          <Head as="h1" size="display" first={q ? "Search results." : total === 1 ? "Issue so far." : "Issues so far."} second={q ? `For “${q}”.` : "All in one place."} />
          <form className="ck-search ck-fade" role="search" action="/issues">
            <label className="sr-only" htmlFor="q">
              Search issues
            </label>
            <input id="q" name="q" type="search" defaultValue={q} placeholder="Search by word or topic" />
            <button type="submit">Search</button>
          </form>
          {tags.length ? (
            <nav className="ck-filters ck-fade" aria-label="Topics">
              {tags.slice(0, 12).map((t) => (
                <Link key={t.slug} className="ck-chip" href={`/topics/${t.slug}`}>
                  {t.name}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </section>

      <section className="ck-section" style={{ paddingTop: 0 }}>
        <div className="ck-container ck-stack">
          {groups.length ? (
            groups.map((g) => (
              <div key={g.month} style={{ width: "100%" }}>
                <p className="kicker ck-month">{g.month}</p>
                <IssueList posts={g.posts} excerpts />
              </div>
            ))
          ) : (
            <div className="ck-stack">
              <p className="lead ck-lead">{q ? "Nothing matches that yet. Try a shorter word." : "No issues yet. The first one lands soon."}</p>
              {q ? (
                <Link className="ck-link" href="/issues" style={{ marginTop: 24 }}>
                  Show every issue <Icon name="arrow" />
                </Link>
              ) : null}
            </div>
          )}
          {pages > 1 ? (
            <nav className="ck-pager" aria-label="Pages">
              {page > 1 ? (
                <Link className="ck-link" href={`/issues?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) })}`}>
                  Newer issues
                </Link>
              ) : (
                <span />
              )}
              {page < pages ? (
                <Link className="ck-link" href={`/issues?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) })}`}>
                  Older issues <Icon name="arrow" />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
