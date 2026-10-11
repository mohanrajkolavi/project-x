import Link from "next/link";
import { PageShell } from "@/components/site";
import { Icon } from "@/components/caro";
import { Sky } from "@/components/CaroRuntime";
import { SubscribeForm } from "@/components/SubscribeForm";
import { FeaturedStory, StoryGrid } from "@/components/issues";
import { livePosts, liveCount, sections } from "@/lib/posts";
import { subscriberCounts } from "@/lib/subscribers";
import { artUrl } from "@/lib/markdown";

export default function Home() {
  const [latest, ...rest] = livePosts({ limit: 7 });
  const recent = rest.slice(0, 6);
  const shown = new Set([latest?.id, ...recent.map((p) => p.id)]);
  const count = liveCount();
  const readers = subscriberCounts().active;
  // One row per section, with stories not already shown above.
  const bySection = sections()
    .map((sec) => ({ ...sec, posts: livePosts({ section: sec.slug }).filter((p) => !shown.has(p.id)).slice(0, 3) }))
    .filter((sec) => sec.posts.length)
    .slice(0, 3);

  return (
    <PageShell cta={false}>
      <section className="nl-hero">
        <Sky palette="lagoon" />
        <div className="nl-wrap nl-hero__grid">
          <div className="nl-hero__copy">
            <p className="nl-kicker">Free newsletter · Every week</p>
            <h1 className="nl-h1">
              Stay ahead <span className="nl-grad">of AI.</span>
            </h1>
            <p className="nl-lead">
              AI news, tech, prompts and links to skills. In your inbox every week.
              {readers >= 50 ? ` Join ${readers.toLocaleString("en-US")} readers.` : ""}
            </p>
            <div className="nl-hero__form">
              <SubscribeForm id="hero" />
            </div>
          </div>
          <div className="nl-hero__art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artUrl("envelope", "lagoon")} alt="" width={420} height={211} fetchPriority="high" />
          </div>
        </div>
      </section>

      {latest ? (
        <div className="nl-wrap nl-block">
          <FeaturedStory post={latest} />
        </div>
      ) : (
        <div className="nl-wrap nl-block">
          <p className="nl-lead">The first issue lands soon. Subscribe above and it reaches you the moment it ships.</p>
        </div>
      )}

      {recent.length ? (
        <section className="nl-wrap nl-block" aria-labelledby="recent">
          <div className="nl-block__head">
            <h2 className="nl-h2" id="recent">
              Recent stories
            </h2>
            {count > recent.length + 1 ? (
              <Link className="nl-link" href="/issues">
                All {count} issues <Icon name="arrow" />
              </Link>
            ) : null}
          </div>
          <StoryGrid posts={recent} />
        </section>
      ) : null}

      {bySection.map((sec) => (
        <section key={sec.slug} className="nl-wrap nl-block" aria-labelledby={`sec-${sec.slug}`}>
          <div className="nl-block__head">
            <h2 className="nl-h2" id={`sec-${sec.slug}`}>
              {sec.name}
            </h2>
            <Link className="nl-link" href={`/sections/${sec.slug}`}>
              See all {sec.count} <Icon name="arrow" />
            </Link>
          </div>
          <StoryGrid posts={sec.posts} />
        </section>
      ))}
    </PageShell>
  );
}
