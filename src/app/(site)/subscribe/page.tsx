import type { Metadata } from "next";
import { PageShell } from "@/components/site";
import { SubscribeForm } from "@/components/SubscribeForm";
import { StoryRows } from "@/components/issues";
import { livePosts } from "@/lib/posts";
import { subscriberCounts } from "@/lib/subscribers";
import { artUrl } from "@/lib/markdown";

export const metadata: Metadata = { title: "Subscribe", alternates: { canonical: "/subscribe" } };

const GET = [
  ["News", "What changed, and why it matters"],
  ["Tech", "How it works, in plain words"],
  ["Prompts", "Ready to copy and use"],
  ["Skills", "Links to learn more"],
];

export default function SubscribePage() {
  const readers = subscriberCounts().active;
  const recent = livePosts({ limit: 3 });
  return (
    <PageShell cta={false}>
      <div className="nl-read nl-message" style={{ minHeight: 0, paddingBottom: 48 }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artUrl("envelope", "lagoon")} alt="" width={300} height={151} style={{ marginBottom: 24 }} />
          <p className="nl-kicker" style={{ marginBottom: 12 }}>
            Free newsletter · Every week
          </p>
          <h1 className="nl-h1">Stay ahead of AI.</h1>
          <p className="nl-lead">
            AI news, tech, prompts and links to skills. In your inbox every week.
            {readers >= 50 ? ` Join ${readers.toLocaleString("en-US")} readers.` : ""}
          </p>
          <div style={{ marginTop: 32 }}>
            <SubscribeForm id="page" center />
          </div>
        </div>
      </div>
      <div className="nl-read nl-block">
        <h2 className="nl-h2" style={{ marginBottom: 16 }}>
          What you get
        </h2>
        <ul className="ck-rows ck-rows--ruled" style={{ marginTop: 0 }}>
          {GET.map(([a, b]) => (
            <li key={a} className="ck-row is-yes">
              <span className="row-name ck-row__name" style={{ fontSize: 18 }}>
                {a}
              </span>
              <span className="result ck-row__status" style={{ fontSize: 16 }}>
                {b}
              </span>
            </li>
          ))}
        </ul>
        {recent.length ? (
          <>
            <h2 className="nl-h2" style={{ margin: "56px 0 16px" }}>
              Recent issues
            </h2>
            <StoryRows posts={recent} />
          </>
        ) : null}
      </div>
    </PageShell>
  );
}
