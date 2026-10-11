import type { ReactNode } from "react";
import Link from "next/link";
import { Avatar, Webb } from "@/components/caro";
import { Sky } from "@/components/CaroRuntime";
import { AdminNav, type NavItem } from "./AdminNav";
import { signOut } from "@/app/admin/actions";

export function AdminShell({ children, nav, handle, label = "Admin" }: { children: ReactNode; nav?: NavItem[]; handle: string; label?: string }) {
  return (
    <div className="ck-root ad-shell pal-lagoon hero-sky">
      <Sky palette="lagoon" seed={11} fixed />
      <header className="ck-header">
        <div className="ck-header__bar">
          <Link className="ck-me" href="/admin">
            <Avatar />
            <span className="meta ck-meta-text">{handle}</span>
          </Link>
          <div className="ck-series">
            <Webb />
            <span className="meta ck-meta-text">{label}</span>
          </div>
        </div>
      </header>
      {nav ? (
        <div className="ad-container">
          <AdminNav items={nav} signOut={signOut} />
        </div>
      ) : null}
      <main className="ad-container ad-main" id="main">
        {children}
      </main>
    </div>
  );
}
