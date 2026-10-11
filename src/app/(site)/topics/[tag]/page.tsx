import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site";
import { StoryGrid } from "@/components/issues";
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
  const posts = livePosts({ tag });
  return (
    <PageShell palette="aurora" hero="mint">
      <div className="nl-wrap nl-page-head">
        <p className="nl-kicker">
          <Link href="/topics" style={{ color: "inherit", textDecoration: "none" }}>
            Topics
          </Link>{" "}
          · {t.count} {t.count === 1 ? "issue" : "issues"}
        </p>
        <h1 className="nl-h1">{t.name}</h1>
      </div>
      <div className="nl-wrap nl-block" style={{ paddingTop: 16 }}>
        <StoryGrid posts={posts} />
      </div>
    </PageShell>
  );
}
