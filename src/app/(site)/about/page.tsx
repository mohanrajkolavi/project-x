import type { Metadata } from "next";
import { PageShell } from "@/components/site";
import { getSettings } from "@/lib/settings";
import { renderWeb } from "@/lib/markdown";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

export default function AboutPage() {
  const s = getSettings();
  return (
    <PageShell palette="orchid" hero="orchid">
      <header className="nl-read ar-head">
        <p className="nl-kicker" style={{ marginBottom: 12 }}>
          About
        </p>
        <h1 className="nl-h1">
          Learn AI. <span className="nl-sec">From A to Z.</span>
        </h1>
        <p className="nl-lead">{s.siteDescription}</p>
      </header>
      <div className="nl-read">
        <div className="ar" dangerouslySetInnerHTML={{ __html: renderWeb(s.about, "orchid") }} />
      </div>
    </PageShell>
  );
}
