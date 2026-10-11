import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar, Head, Webb } from "./caro";
import { Sky } from "./CaroRuntime";
import { SubscribeForm } from "./SubscribeForm";
import { SiteMenu } from "./SiteMenu";
import { artUrl } from "@/lib/markdown";
import { sections } from "@/lib/posts";

export function SiteHeader({ label, handle }: { label: string; handle: string }) {
  return (
    <header className="ck-header">
      <div className="ck-header__bar">
        <SiteMenu
          avatar={<Avatar />}
          handle={handle}
          main={[
            { href: "/", label: "Home" },
            { href: "/issues", label: "Every issue" },
            { href: "/topics", label: "Topics" },
            { href: "/about", label: "About" },
          ]}
          sections={sections().map((x) => ({ href: `/sections/${x.slug}`, label: x.name, note: `${x.count} ${x.count === 1 ? "issue" : "issues"}` }))}
        />
        <div className="ck-series">
          <Webb />
          <span className="meta ck-meta-text">{label}</span>
        </div>
      </div>
    </header>
  );
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/issues", label: "Issues" },
  { href: "/topics", label: "Topics" },
  { href: "/about", label: "About" },
  { href: "/feed.xml", label: "RSS" },
];

export function SiteFooter({ handle }: { handle: string }) {
  return (
    <footer className="ck-site-footer">
      <div className="ck-container">
        <div className="ck-footer">
          <nav aria-label="Site" className="ck-foot-nav">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="meta ck-foot-link" prefetch={n.href === "/feed.xml" ? false : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <p className="fine ck-foot-fine">
            {handle} · {new Date().getUTCFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

/** The one ask, last on every page. */
export function NewsletterClose({ palette = "lagoon" }: { palette?: string }) {
  return (
    <section className="ck-section ck-section--cta" id="newsletter">
      <div className="ck-container ck-stack ck-stack--center" data-ck-reveal>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ck-art ck-art-float ck-cta-art" src={artUrl("envelope", palette)} alt="" width={420} height={211} />
        <Head first="Stay ahead" second="of AI." size="display" />
        <p className="lead ck-lead ck-fade">AI news, tech, prompts and links to skills. In your inbox every week.</p>
        <div className="ck-fade ck-cta-form">
          <SubscribeForm />
        </div>
      </div>
    </section>
  );
}

/** Wraps a public page: palette, sky, header, the page, the newsletter close and the footer. */
export function PageShell({
  palette = "lagoon",
  hero = "sky",
  label,
  handle,
  children,
  close = true,
}: {
  palette?: string;
  hero?: string;
  label: string;
  handle: string;
  children: ReactNode;
  close?: boolean;
}) {
  return (
    <div className={`ck-root ck-shell pal-${palette} hero-${hero}`}>
      <Sky palette={palette} />
      <a className="ck-skip" href="#main">
        Skip to content
      </a>
      <SiteHeader label={label} handle={handle} />
      <main id="main" className="ck-page">
        {children}
        {close ? <NewsletterClose palette={palette} /> : null}
      </main>
      <SiteFooter handle={handle} />
    </div>
  );
}
