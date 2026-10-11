"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type MenuLink = { href: string; label: string; note?: string };

/**
 * Site navigation lives behind the avatar, as the design system asks.
 * The avatar opens a full-screen menu on the page surface: sections, pages and search.
 */
export function SiteMenu({ avatar, handle, main, sections }: { avatar: ReactNode; handle: string; main: MenuLink[]; sections: MenuLink[] }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("input, a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a, button, input");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

  return (
    <>
      <button ref={button} type="button" className="ck-me ck-menu-btn" aria-expanded={open} aria-controls="site-menu" aria-label={open ? "Close menu" : `Menu · ${handle}`} onClick={() => setOpen((o) => !o)}>
        {avatar}
        <span className="meta ck-meta-text">{handle}</span>
        <span className="ck-menu-btn__hint meta" aria-hidden="true">
          {open ? "Close" : "Menu"}
        </span>
      </button>
      {open ? (
        <div className="ck-menu" id="site-menu" ref={panel} role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="ck-menu__inner">
            <form className="ck-search ck-menu__search" role="search" action="/issues">
              <label className="sr-only" htmlFor="menu-q">
                Search every issue
              </label>
              <input id="menu-q" name="q" type="search" placeholder="Search every issue" />
              <button type="submit">Search</button>
            </form>
            <div className="ck-menu__cols">
              <nav aria-label="Pages">
                <p className="kicker ck-kicker">Read</p>
                <ul className="ck-menu__list">
                  {main.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="title ck-menu__link" aria-current={current(l.href) ? "page" : undefined}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              {sections.length ? (
                <nav aria-label="Sections">
                  <p className="kicker ck-kicker">Sections</p>
                  <ul className="ck-menu__list ck-menu__list--small">
                    {sections.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="ck-menu__link ck-menu__link--small" aria-current={current(l.href) ? "page" : undefined}>
                          <span>{l.label}</span>
                          {l.note ? <span className="ck-menu__note">{l.note}</span> : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
