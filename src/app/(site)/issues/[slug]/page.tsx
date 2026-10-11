import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site";
import { Head } from "@/components/caro";
import { getSettings } from "@/lib/settings";
import { livePostBySlug, neighbours, tagList, tagSlug } from "@/lib/posts";
import { artUrl, renderWeb } from "@/lib/markdown";
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
  const { newer, older } = neighbours(post);
  const tags = tagList(post);
  const numeral = post.numeral.trim().slice(0, 4);

  return (
    <PageShell label={post.label} handle={s.handle} palette={post.palette} hero={post.hero}>
      <article>
        <section className="ck-section ck-section--hero">
          <div className="ck-container ck-stack ck-stack--center" data-ck-reveal>
            <p className="kicker ck-kicker ck-fade">
              {post.label} · {longDate(post.published_at)}
            </p>
            {numeral ? (
              <div className="ck-numeral" data-ck-orbits>
                <span className={`${numeral.length <= 2 ? "hero-xl" : "hero"} ck-hero`}>{numeral}</span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="ck-art ck-art-float ck-hero-art ck-fade" src={artUrl(post.art, post.palette)} alt="" width={440} height={300} />
            )}
            <Head as="h1" size="display" first={post.title} second={post.title_sec || undefined} />
            {post.excerpt ? <p className="lead ck-lead ck-fade">{post.excerpt}</p> : null}
            {tags.length ? (
              <p className="meta ck-meta-line ck-fade">
                {tags.map((t, i) => (
                  <span key={t}>
                    {i ? " · " : ""}
                    <Link href={`/topics/${tagSlug(t)}`}>{t}</Link>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </section>

        <div dangerouslySetInnerHTML={{ __html: renderWeb(post.body, post.palette) }} />
      </article>

      {newer || older ? (
        <section className="ck-section">
          <div className="ck-container ck-stack" data-ck-reveal>
            <p className="kicker ck-kicker ck-fade">Keep reading</p>
            <nav className="ck-nextprev ck-fade" aria-label="More issues">
              {older ? (
                <Link href={`/issues/${older.slug}`}>
                  <p className="kicker ck-kicker">Previous</p>
                  <p className="title" style={{ margin: 0 }}>{older.title}</p>
                </Link>
              ) : null}
              {newer ? (
                <Link href={`/issues/${newer.slug}`}>
                  <p className="kicker ck-kicker">Next</p>
                  <p className="title" style={{ margin: 0 }}>{newer.title}</p>
                </Link>
              ) : null}
            </nav>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
