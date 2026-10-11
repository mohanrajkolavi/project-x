import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { subscriberCounts } from "@/lib/subscribers";
import { db } from "@/lib/db";
import { resumeSends } from "@/lib/campaigns";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };

let resumed = false;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!resumed) {
    resumed = true;
    resumeSends();
  }
  const s = getSettings();
  const outbox = (db().prepare("SELECT COUNT(*) n FROM outbox").get() as { n: number }).n;
  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/posts", label: "Issues" },
    { href: "/admin/sends", label: "Sends" },
    { href: "/admin/subscribers", label: "Subscribers", count: subscriberCounts().active },
    { href: "/admin/outbox", label: "Outbox", count: outbox || undefined },
    ...(user.role === "owner" ? [{ href: "/admin/settings", label: "Settings" }] : []),
    { href: "/admin/team", label: "Team" },
  ];
  return (
    <AdminShell nav={nav} handle={s.handle}>
      {children}
    </AdminShell>
  );
}
