import Link from "next/link";
import { readMinutes, type Post } from "@/lib/content";
import { shortDate } from "@/lib/format";
import { artUrl } from "@/lib/markdown";

export const storyMeta = (p: Post) => `${shortDate(p.published_at)} · ${readMinutes(p)} min read`;

/** The post's art (or its hero number) on a faint surface tinted by its palette. */
export function Thumb({ post, eager = false }: { post: Post; eager?: boolean }) {
  const n = post.numeral.trim().slice(0, 4);
  return (
    <span className={`nl-thumb pal-${post.palette} hero-${post.hero}`} aria-hidden="true">
      {n ? (
        <span className="nl-thumb__num ck-hero">{n}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={artUrl(post.art, post.palette)} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
      )}
    </span>
  );
}

function Title({ post }: { post: Post }) {
  return (
    <>
      {post.title}
      {post.title_sec ? <span className="nl-sec"> {post.title_sec}</span> : null}
    </>
  );
}

export function StoryCard({ post }: { post: Post }) {
  return (
    <Link className="nl-card" href={`/issues/${post.slug}`}>
      <Thumb post={post} />
      <span className="nl-kicker">{post.label}</span>
      <h3 className="nl-card__title">
        <Title post={post} />
      </h3>
      {post.excerpt ? <p className="nl-card__excerpt">{post.excerpt}</p> : null}
      <span className="nl-meta nl-card__meta">{storyMeta(post)}</span>
    </Link>
  );
}

export function StoryGrid({ posts }: { posts: Post[] }) {
  return (
    <ul className="nl-grid">
      {posts.map((p) => (
        <li key={p.id}>
          <StoryCard post={p} />
        </li>
      ))}
    </ul>
  );
}

export function FeaturedStory({ post }: { post: Post }) {
  return (
    <Link className="nl-feature" href={`/issues/${post.slug}`}>
      <Thumb post={post} eager />
      <span className="nl-feature__copy">
        <span className="nl-kicker">Latest · {post.label}</span>
        <h2 className="nl-feature__title">
          <Title post={post} />
        </h2>
        {post.excerpt ? <span className="nl-lead">{post.excerpt}</span> : null}
        <span className="nl-meta">{storyMeta(post)}</span>
      </span>
    </Link>
  );
}

/** Compact rows for the archive: title, section, date and reading time. */
export function StoryRows({ posts, excerpts = false }: { posts: Post[]; excerpts?: boolean }) {
  return (
    <ul className="nl-list">
      {posts.map((p) => (
        <li key={p.id}>
          <Link className="nl-row" href={`/issues/${p.slug}`}>
            <h3 className="nl-row__title">
              <Title post={p} />
            </h3>
            <span className="nl-row__aside">{storyMeta(p)}</span>
            <span className="nl-row__sub">
              <span style={{ color: "var(--sig-text)" }}>{p.label}</span>
              {excerpts && p.excerpt ? ` · ${p.excerpt}` : ""}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
