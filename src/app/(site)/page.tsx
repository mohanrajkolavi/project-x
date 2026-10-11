import Link from "next/link";
import { PageShell } from "@/components/site";
import { Head, Icon, PlanetButton } from "@/components/caro";
import { StoryList } from "@/components/issues";
import { getSettings } from "@/lib/settings";
import { livePosts, topics, liveCount, sections } from "@/lib/posts";
import { readMinutes } from "@/lib/content";
import { artUrl } from "@/lib/markdown";
import { shortDate } from "@/lib/format";

export default function Home() {
  const s = getSettings();
  const [latest, ...rest] = livePosts({ limit: 9 });
  const more = rest.slice(0, 8);
  const tags = topics().slice(0, 12);
  const secs = sections();
  const count = liveCount();

  return (
    <PageShell label="Weekly" handle={s.handle} palette="lagoon" hero="sky">
      {/* Hero: the question the newsletter answers */}
      <section className="ck-section ck-section--hero">
        <div className="ck-container ck-stack ck-stack--center" data-ck-reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ck-art ck-art-float ck-hero-art ck-fade" src={artUrl("comet", "lagoon")} alt="" width={440} height={300} />
          <p className="kicker ck-kicker ck-fade">Free newsletter · Every week</p>
          <Head as="h1" size="display" first="What changed" second="in AI this week?" grad />
          <p className="lead ck-lead ck-fade">AI news, tech, prompts and links to skills. Short reads in plain words, one idea at a time.</p>
          <div className="ck-actions ck-fade" style={{ justifyContent: "center" }}>
            {latest ? (
              <Link className="ck-next meta" href={`/issues/${latest.slug}`}>
                <span>Read the latest</span>
                <PlanetButton />
              </Link>
            ) : null}
            <a className="ck-link" href="#newsletter">
              Get it by email <Icon name="down" />
            </a>
          </div>
        </div>
      </section>

      {latest ? (
        <section className="ck-section">
          <div className="ck-container ck-split ck-split--art-left" data-ck-reveal>
            <div className="ck-split__art ck-fade">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ck-art" src={artUrl(latest.art, latest.palette)} alt="" width={400} height={300} style={{ opacity: 0.9 }} />
            </div>
            <div className="ck-stack">
              <p className="kicker ck-kicker ck-fade">
                Latest · {latest.label} · {shortDate(latest.published_at)} · {readMinutes(latest)} min read
              </p>
              <Head first={latest.title} second={latest.title_sec || undefined} />
              {latest.excerpt ? <p className="lead ck-lead ck-fade">{latest.excerpt}</p> : null}
              <div className="ck-actions ck-fade">
                <Link className="ck-link" href={`/issues/${latest.slug}`}>
                  Read it in {readMinutes(latest)} {readMinutes(latest) === 1 ? "minute" : "minutes"} <Icon name="arrow" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="ck-section">
          <div className="ck-container ck-stack" data-ck-reveal>
            <p className="kicker ck-kicker ck-fade">Coming soon</p>
            <Head first="The first issue" second="lands this week." />
            <p className="lead ck-lead ck-fade">Join below and it reaches you the moment it ships.</p>
          </div>
        </section>
      )}

      {more.length ? (
        <section className="ck-section">
          <div className="ck-container ck-stack" data-ck-reveal>
            <p className="kicker ck-kicker ck-fade">More stories</p>
            <Head first="Catch up." second="One story at a time." />
            <div className="ck-fade" style={{ width: "100%" }}>
              <StoryList posts={more} />
            </div>
            {count > more.length + 1 ? (
              <div className="ck-actions ck-fade">
                <Link className="ck-link" href="/issues">
                  See all {count} issues <Icon name="arrow" />
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {secs.length ? (
        <section className="ck-section">
          <div className="ck-container ck-stack" data-ck-reveal>
            <p className="kicker ck-kicker ck-fade">Sections</p>
            <Head first="Pick by the job." second="Start where you are." />
            <ul className="ck-rows ck-rows--links ck-fade">
              {secs.map((t) => (
                <li key={t.slug}>
                  <Link className="ck-row-link" href={`/sections/${t.slug}`}>
                    <span className="ck-row is-yes">
                      <span className="row-name ck-row__name">{t.name}</span>
                      <span className="result ck-row__status">
                        {t.count} {t.count === 1 ? "issue" : "issues"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {tags.length ? (
              <nav className="ck-filters ck-fade" aria-label="Topics" style={{ marginTop: 40 }}>
                {tags.map((t) => (
                  <Link key={t.slug} className="ck-chip" href={`/topics/${t.slug}`}>
                    {t.name}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
