import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site";
import { StoryRows } from "@/components/issues";
import { livePosts, sections, type Post } from "@/lib/posts";
import { monthKey } from "@/lib/format";

export const metadata: Metadata = { title: "Archive", alternates: { canonical: "/issues" } };

const PER_PAGE = 30;

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; section?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q || "").trim().slice(0, 80);
  const secs = sections();
  const section = secs.find((x) => x.slug === sp.section)?.slug || "";
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const all = livePosts({ q: q || undefined, section: section || undefined });
  const posts = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const total = livePosts().length;
  const href = (o: Record<string, string | number>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, section, ...o })) if (v) p.set(k, String(v));
    return `/issues${p.size ? `?${p}` : ""}`;
  };

  const groups: { month: string; posts: Post[] }[] = [];
  for (const p of posts) {
    const m = monthKey(p.published_at);
    if (groups.at(-1)?.month !== m) groups.push({ month: m, posts: [] });
    groups.at(-1)!.posts.push(p);
  }

  return (
    <PageShell>
      <div className="nl-wrap nl-page-head">
        <p className="nl-kicker">Archive · {total} {total === 1 ? "issue" : "issues"}</p>
        <h1 className="nl-h1">{q ? `Results for “${q}”` : "Every issue."}</h1>
        <form className="ck-search" role="search" action="/issues" id="search" style={{ marginTop: 28 }}>
          {section ? <input type="hidden" name="section" value={section} /> : null}
          <label className="sr-only" htmlFor="q">
            Search issues
          </label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Search by word or topic" />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="nl-wrap">
        {secs.length > 1 ? (
          <nav className="nl-tabs" aria-label="Sections">
            <Link className="nl-tab" href={href({ section: "", page: "" })} aria-current={!section ? "true" : undefined}>
              All <span>{total}</span>
            </Link>
            {secs.map((x) => (
              <Link key={x.slug} className="nl-tab" href={href({ section: x.slug, page: "" })} aria-current={section === x.slug ? "true" : undefined}>
                {x.name} <span>{x.count}</span>
              </Link>
            ))}
          </nav>
        ) : null}

        {groups.length ? (
          groups.map((g) => (
            <section key={g.month} aria-label={g.month}>
              <h2 className="nl-month">{g.month}</h2>
              <StoryRows posts={g.posts} />
            </section>
          ))
        ) : (
          <p className="nl-lead" style={{ padding: "48px 0" }}>
            {q ? "Nothing matches that yet. Try a shorter word." : "No issues yet. The first one lands soon."}
          </p>
        )}

        {pages > 1 ? (
          <nav className="nl-pager" aria-label="Pages">
            {page > 1 ? (
              <Link className="nl-btn nl-btn--ghost" href={href({ page: page - 1 })}>
                Newer
              </Link>
            ) : (
              <span />
            )}
            <span className="nl-meta" style={{ alignSelf: "center" }}>
              Page {page} of {pages}
            </span>
            {page < pages ? (
              <Link className="nl-btn nl-btn--ghost" href={href({ page: page + 1 })}>
                Older
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>
    </PageShell>
  );
}
