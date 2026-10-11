import Link from "next/link";
import type { Post } from "@/lib/posts";
import { shortDate } from "@/lib/format";

/** Hairline rows of issues: kicker, two-line title, date, optional excerpt. */
export function IssueList({ posts, excerpts = false, className = "" }: { posts: Post[]; excerpts?: boolean; className?: string }) {
  return (
    <ul className={`ck-issues ${className}`}>
      {posts.map((p) => (
        <li key={p.id} className="ck-issue">
          <Link className="ck-issue__link" href={`/issues/${p.slug}`}>
            <p className="kicker ck-issue__kicker">{p.label}</p>
            <h3 className="row-name ck-issue__title">
              {p.title} {p.title_sec ? <span className="ck-sec">{p.title_sec}</span> : null}
            </h3>
            <span className="meta ck-issue__date">{shortDate(p.published_at)}</span>
            {excerpts && p.excerpt ? <p className="fine ck-issue__excerpt">{p.excerpt}</p> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
