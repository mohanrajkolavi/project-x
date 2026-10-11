import Link from "next/link";
import { readMinutes, type Post } from "@/lib/content";
import { shortDate } from "@/lib/format";
import { artUrl } from "@/lib/markdown";

const meta = (p: Post, date = true) => [p.label, date ? shortDate(p.published_at) : "", `${readMinutes(p)} min read`].filter(Boolean).join(" · ");

/** Hairline rows of issues: kicker, two-line title, date, optional excerpt. */
export function IssueList({ posts, excerpts = false, className = "" }: { posts: Post[]; excerpts?: boolean; className?: string }) {
  return (
    <ul className={`ck-issues ${className}`}>
      {posts.map((p) => (
        <li key={p.id} className="ck-issue">
          <Link className="ck-issue__link" href={`/issues/${p.slug}`}>
            <p className="kicker ck-issue__kicker">{meta(p, false)}</p>
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

/** The front-page feed: each story with its art beside the words, on hairlines. */
export function StoryList({ posts, className = "" }: { posts: Post[]; className?: string }) {
  return (
    <ul className={`ck-stories ${className}`}>
      {posts.map((p) => (
        <li key={p.id} className="ck-story">
          <Link className="ck-story__link" href={`/issues/${p.slug}`}>
            <span className="ck-story__art" aria-hidden="true">
              {p.numeral.trim() ? (
                <span className={`ck-hero ck-story__num pal-${p.palette} hero-${p.hero}`}>{p.numeral.trim().slice(0, 4)}</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={artUrl(p.art, p.palette)} alt="" loading="lazy" />
              )}
            </span>
            <span className="ck-story__words">
              <span className="kicker ck-story__kicker">{meta(p)}</span>
              <span className="title ck-story__title">
                {p.title} {p.title_sec ? <span className="ck-sec">{p.title_sec}</span> : null}
              </span>
              {p.excerpt ? <span className="body ck-story__excerpt">{p.excerpt}</span> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
