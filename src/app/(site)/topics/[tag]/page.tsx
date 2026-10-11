import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site";
import { Head, Icon } from "@/components/caro";
import { IssueList } from "@/components/issues";
import { getSettings } from "@/lib/settings";
import { livePosts, topics } from "@/lib/posts";

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const t = topics().find((x) => x.slug === tag);
  return t ? { title: t.name, alternates: { canonical: `/topics/${t.slug}` } } : { title: "Not found" };
}

export default async function TopicPage({ params }: Props) {
  const { tag } = await params;
  const t = topics().find((x) => x.slug === tag);
  if (!t) notFound();
  const s = getSettings();
  const posts = livePosts({ tag });
  return (
    <PageShell label="Topics" handle={s.handle} palette="aurora" hero="mint">
      <section className="ck-section ck-section--hero">
        <div className="ck-container ck-stack" data-ck-reveal>
          <p className="kicker ck-kicker ck-fade">
            Topic · {t.count} {t.count === 1 ? "issue" : "issues"}
          </p>
          <Head as="h1" size="display" first={`${t.name}.`} second="Every issue on it." />
          <div className="ck-fade" style={{ width: "100%" }}>
            <IssueList posts={posts} excerpts />
          </div>
          <div className="ck-actions ck-fade">
            <Link className="ck-link" href="/topics">
              All topics <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
