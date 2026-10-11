"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; count?: number };

export function AdminNav({ items, signOut }: { items: NavItem[]; signOut: () => Promise<void> }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/"));
  return (
    <nav className="ad-nav" aria-label="Admin">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className="ad-nav__link" aria-current={active(i.href) ? "page" : undefined}>
          {i.label}
          {i.count ? <span className="ad-nav__count">{i.count}</span> : null}
        </Link>
      ))}
      <span className="ad-nav__spacer" />
      <Link href="/" className="ad-nav__link" target="_blank">
        View site
      </Link>
      <form action={signOut}>
        <button className="ad-nav__link" type="submit">
          Sign out
        </button>
      </form>
    </nav>
  );
}
