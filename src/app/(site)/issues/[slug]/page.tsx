import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, SubscribeBox } from "@/components/site";
import { Avatar } from "@/components/caro";
import { StoryGrid, Thumb } from "@/components/issues";
import { getSettings } from "@/lib/settings";
import { livePostBySlug, relatedPosts, tagList, tagSlug } from "@/lib/posts";
import { readMinutes, slugPart } from "@/lib/content";
import { renderWeb } from "@/lib/markdown";
import { longDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = livePostBySlug(slug);
  if (!p) return { title: "Not found" };
  const title = `${p.title}${p.title_sec ? ` ${p.title_sec}` : ""}`;
  return {
    title,
    description: p.excerpt,
    alternates: { canonical: `/issues/${p.slug}` },
    openGraph: { title, description: p.excerpt, type: "article", publishedTime: p.published_at ?? undefined },
  };
}

export default async function IssuePage({ params }: Props) {
  const { slug } = await params;
  const post = livePostBySlug(slug);
  if (!post) notFound();
  const s = getSettings();
  const related = relatedPosts(post, 3);
  const tags = tagList(post);

  return (
    <PageShell palette={post.palette} hero={post.hero} cta={false}>
      <article>
        <header className="nl-read ar-head">
          <nav className="ar-crumbs" aria-label="Breadcrumb">
            <Link href="/issues">Archive</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/sections/${slugPart(post.label)}`}>{post.label}</Link>
          </nav>
          <h1 className="nl-h1">
            {post.title}
            {post.title_sec ? <span className="nl-sec"> {post.title_sec}</span> : null}
          </h1>
          {post.excerpt ? <p className="nl-lead">{post.excerpt}</p> : null}
          <div className="ar-byline">
            <Avatar />
            <span>
              <b>{s.fromName || s.handle}</b> · {longDate(post.published_at)} · {readMinutes(post)} min read
            </span>
          </div>
          <div className="ar-cover">
            <Thumb post={post} eager />
          </div>
        </header>

        <div className="nl-read">
          <div className="ar" dangerouslySetInnerHTML={{ __html: renderWeb(post.body, post.palette) }} />
          {tags.length ? (
            <nav className="ar-tags" aria-label="Topics">
              {tags.map((t) => (
                <Link key={t} className="ck-chip" href={`/topics/${tagSlug(t)}`}>
                  {t}
                </Link>
              ))}
            </nav>
          ) : null}
          <div className="ar-end">
            <SubscribeBox palette={post.palette} title="Enjoyed this? Get the next one." />
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="nl-wrap nl-block" aria-labelledby="next">
          <div className="nl-block__head">
            <h2 className="nl-h2" id="next">
              Read next
            </h2>
          </div>
          <StoryGrid posts={related} />
        </section>
      ) : null}
    </PageShell>
  );
}
