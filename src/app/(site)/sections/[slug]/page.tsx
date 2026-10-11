import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site";
import { Head, Icon } from "@/components/caro";
import { StoryList } from "@/components/issues";
import { getSettings } from "@/lib/settings";
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
  const s = getSettings();
  const posts = livePosts({ section: slug });
  const latest = posts[0];
  return (
    <PageShell label={sec.name} handle={s.handle} palette={latest?.palette ?? "lagoon"} hero={latest?.hero ?? "sky"}>
      <section className="ck-section ck-section--hero">
        <div className="ck-container ck-stack" data-ck-reveal>
          <p className="kicker ck-kicker ck-fade">
            Section · {sec.count} {sec.count === 1 ? "issue" : "issues"}
          </p>
          <Head as="h1" size="display" first={`${sec.name}.`} second="Every one so far." />
          <div className="ck-fade" style={{ width: "100%" }}>
            <StoryList posts={posts} />
          </div>
          <div className="ck-actions ck-fade">
            <Link className="ck-link" href="/issues">
              Every issue <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
