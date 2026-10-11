"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type MenuLink = { href: string; label: string; note?: string };

/** The full menu: search, pages and every section. The only nav on phones. */
export function SiteMenu({ main, sections }: { main: MenuLink[]; sections: MenuLink[] }) {
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
      <button ref={button} type="button" className="nl-icon-btn nl-menu-btn" aria-expanded={open} aria-controls="site-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open
        ? createPortal(
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
                <p className="ck-kicker">Read</p>
                <ul className="ck-menu__list">
                  {main.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="ck-menu__link" aria-current={current(l.href) ? "page" : undefined}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              {sections.length ? (
                <nav aria-label="Sections">
                  <p className="ck-kicker">Sections</p>
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
      , document.body)
        : null}
    </>
  );
}
