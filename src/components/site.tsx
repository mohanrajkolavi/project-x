import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "./caro";
import { SubscribeForm } from "./SubscribeForm";
import { SiteMenu } from "./SiteMenu";
import { NavLinks } from "./NavLinks";
import { artUrl } from "@/lib/markdown";
import { sections } from "@/lib/posts";
import { getSettings } from "@/lib/settings";

const plural = (n: number) => `${n} ${n === 1 ? "issue" : "issues"}`;

export function SiteHeader() {
  const s = getSettings();
  const secs = sections();
  const nav = [{ href: "/", label: "Latest" }, ...secs.slice(0, 4).map((x) => ({ href: `/sections/${x.slug}`, label: x.name })), { href: "/issues", label: "Archive" }, { href: "/about", label: "About" }];
  return (
    <header className="nl-header">
      <div className="nl-wrap nl-header__bar">
        <Link className="nl-brand" href="/" aria-label={`${s.handle}, home`}>
          <Avatar />
          <span className="nl-brand__name">{s.handle}</span>
        </Link>
        <NavLinks items={nav} />
        <div className="nl-header__end">
          <Link className="nl-icon-btn" href="/issues#search" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4.5 4.5" />
            </svg>
          </Link>
          <Link className="nl-btn" href="/subscribe">
            Subscribe
          </Link>
          <SiteMenu
            main={[
              { href: "/", label: "Latest" },
              { href: "/issues", label: "Archive" },
              { href: "/topics", label: "Topics" },
              { href: "/about", label: "About" },
              { href: "/subscribe", label: "Subscribe" },
            ]}
            sections={secs.map((x) => ({ href: `/sections/${x.slug}`, label: x.name, note: plural(x.count) }))}
          />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const s = getSettings();
  const secs = sections();
  return (
    <footer className="nl-footer">
      <div className="nl-wrap">
        <div className="nl-footer__grid">
          <div className="nl-footer__brand">
            <Link className="nl-brand" href="/">
              <Avatar />
              <span>{s.handle}</span>
            </Link>
            <p className="nl-footer__about">{s.siteDescription}</p>
          </div>
          <nav aria-label="Sections">
            <h2>Sections</h2>
            <ul>
              {secs.map((x) => (
                <li key={x.slug}>
                  <Link href={`/sections/${x.slug}`}>{x.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/topics">All topics</Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Site">
            <h2>Site</h2>
            <ul>
              <li><Link href="/issues">Archive</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/subscribe">Subscribe</Link></li>
              <li><Link href="/feed.xml" prefetch={false}>RSS feed</Link></li>
            </ul>
          </nav>
        </div>
        <div className="nl-footer__base">
          <span>
            © {new Date().getUTCFullYear()} {s.handle}
          </span>
          <span>Plain words about AI. Every week.</span>
        </div>
      </div>
    </footer>
  );
}

/** The newsletter ask as a compact box: used at the end of articles and listing pages. */
export function SubscribeBox({ palette = "lagoon", title = "Stay ahead of AI." }: { palette?: string; title?: string }) {
  return (
    <section className={`nl-cta pal-${palette}`} id="newsletter" aria-labelledby="cta-title">
      <div>
        <h2 className="nl-h2" id="cta-title">
          {title}
        </h2>
        <p className="nl-lead">AI news, tech, prompts and links to skills. In your inbox every week.</p>
        <SubscribeForm id="cta" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="nl-cta__art" src={artUrl("envelope", palette)} alt="" width={220} height={111} loading="lazy" decoding="async" />
    </section>
  );
}

/** Wraps a public page: header, the page, an optional subscribe box and the footer. */
export function PageShell({ palette = "lagoon", hero = "sky", children, cta = true }: { palette?: string; hero?: string; children: ReactNode; cta?: boolean }) {
  return (
    <div className={`ck-root nl pal-${palette} hero-${hero}`}>
      <a className="ck-skip" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        {children}
        {cta ? (
          <div className="nl-wrap nl-block">
            <SubscribeBox palette={palette} />
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
