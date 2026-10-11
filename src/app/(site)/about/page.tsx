import type { Metadata } from "next";
import { PageShell } from "@/components/site";
import { Head } from "@/components/caro";
import { getSettings } from "@/lib/settings";
import { renderWeb } from "@/lib/markdown";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

export default function AboutPage() {
  const s = getSettings();
  return (
    <PageShell label="About" handle={s.handle} palette="orchid" hero="orchid">
      <section className="ck-section ck-section--hero">
        <div className="ck-container ck-stack ck-stack--center" data-ck-reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ck-art ck-art-float ck-hero-art ck-fade" src="/art/bulb.svg?pal=orchid" alt="" width={440} height={300} />
          <Head as="h1" size="display" first="Learn AI." second="From A to Z." grad />
          <p className="lead ck-lead ck-fade">{s.siteDescription}</p>
        </div>
      </section>
      <div dangerouslySetInnerHTML={{ __html: renderWeb(s.about, "orchid") }} />
    </PageShell>
  );
}
