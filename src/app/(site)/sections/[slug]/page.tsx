import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site";
import { StoryGrid } from "@/components/issues";
import { livePosts, sections } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = sections().find((x) => x.slug === slug);
  return s ? { title: s.name, alternates: { canonical: `/sections/${s.slug}` } } : { title: "Not found" };
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  const sec = sections().find((x) => x.slug === slug);
  if (!sec) notFound();
  const posts = livePosts({ section: slug });
  return (
    <PageShell palette={posts[0]?.palette} hero={posts[0]?.hero}>
      <div className="nl-wrap nl-page-head">
        <p className="nl-kicker">
          Section · {sec.count} {sec.count === 1 ? "issue" : "issues"}
        </p>
        <h1 className="nl-h1">{sec.name}</h1>
      </div>
      <div className="nl-wrap nl-block" style={{ paddingTop: 16 }}>
        <StoryGrid posts={posts} />
      </div>
    </PageShell>
  );
}
