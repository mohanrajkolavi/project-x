import type { Metadata } from "next";
import Link from "next/link";
import { allPosts, postState } from "@/lib/posts";
import { db } from "@/lib/db";
import { shortDate } from "@/lib/format";
import { ConfirmButton } from "@/components/admin/forms";
import { removePost } from "../../actions";

export const metadata: Metadata = { title: "Issues" };

const TABS = [
  { key: "", label: "All" },
  { key: "published", label: "Published" },
  { key: "scheduled", label: "Scheduled" },
  { key: "draft", label: "Drafts" },
] as const;

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ status?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const status = TABS.find((t) => t.key === sp.status)?.key || "";
  const everything = allPosts();
  const posts = status ? everything.filter((p) => postState(p).toLowerCase() === status) : everything;
  const views = new Map(
    (db().prepare("SELECT post_id, COUNT(*) n FROM page_views WHERE post_id IS NOT NULL GROUP BY post_id").all() as { post_id: number; n: number }[]).map((r) => [r.post_id, r.n]),
  );
  const count = (k: string) => (k ? everything.filter((p) => postState(p).toLowerCase() === k).length : everything.length);

  return (
    <>
      <div className="ad-head">
        <div>
          <p className="kicker ck-kicker">Content</p>
          <h1 className="ad-title">Issues.</h1>
          <p className="ad-sub">Write, schedule and publish. Each issue is a web page and can be sent as an email.</p>
        </div>
        <div className="ad-head__actions">
          <Link className="ad-btn ad-btn--primary" href="/admin/posts/new">
            Write an issue
          </Link>
        </div>
      </div>
      {sp.deleted ? <p className="ad-flash" role="status">Issue deleted.</p> : null}
      <nav className="ad-tabs" aria-label="Filter">
        {TABS.map((t) => (
          <Link key={t.key} href={t.key ? `/admin/posts?status=${t.key}` : "/admin/posts"} aria-current={t.key === status ? "true" : undefined}>
            {t.label} <span>{count(t.key)}</span>
          </Link>
        ))}
      </nav>
      {posts.length ? (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Status</th>
                <th>Date</th>
                <th className="num">Views</th>
                <th className="actions">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => {
                const st = postState(p);
                return (
                  <tr key={p.id}>
                    <td className="main">
                      <Link href={`/admin/posts/${p.id}`}>
                        {p.title} {p.title_sec ? <span className="ad-muted">{p.title_sec}</span> : null}
                      </Link>
                      <span className="sub">
                        {p.label}
                        {p.tags ? ` · ${p.tags}` : ""}
                      </span>
                    </td>
                    <td>
                      <span className={`ad-status is-${st.toLowerCase()}`}>{st}</span>
                    </td>
                    <td>{shortDate(p.published_at || p.updated_at)}</td>
                    <td className="num">{(views.get(p.id) ?? 0).toLocaleString("en-US")}</td>
                    <td className="actions">
                      {st === "Published" ? (
                        <Link className="ad-btn ad-btn--small ad-btn--text" href={`/issues/${p.slug}`} target="_blank">
                          View
                        </Link>
                      ) : null}
                      <Link className="ad-btn ad-btn--small" href={`/admin/posts/${p.id}`}>
                        Edit
                      </Link>
                      <ConfirmButton action={removePost} fields={{ id: p.id }} label="Delete" question={`Delete “${p.title}”? This can’t be undone.`} text />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="ad-empty">
          <p className="lead">{status ? "Nothing here yet." : "No issues yet. Write the first one."}</p>
          <Link className="ad-btn" href="/admin/posts/new">
            Write an issue
          </Link>
        </div>
      )}
    </>
  );
}
