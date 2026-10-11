import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { StateForm, Submit } from "@/components/admin/forms";
import { Head } from "@/components/caro";
import { currentUser, userCount } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (userCount() === 0) redirect("/admin/setup");
  if (await currentUser()) redirect("/admin");
  const { next = "" } = await searchParams;
  return (
    <AdminShell handle={getSettings().handle}>
      <div className="ad-auth">
        <div className="ad-auth__box">
          <p className="kicker ck-kicker">Admin</p>
          <Head as="h1" size="headline" first="Welcome back." second="Sign in to write." words={false} />
          <StateForm action={signIn}>
            <input type="hidden" name="next" value={next} />
            <div className="ad-field">
              <label htmlFor="email">Email</label>
              <input className="ad-input" id="email" name="email" type="email" autoComplete="username" required autoFocus />
            </div>
            <div className="ad-field">
              <label htmlFor="password">Password</label>
              <input className="ad-input" id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <div className="ad-form-actions">
              <Submit primary pendingText="Signing in…">Sign in</Submit>
            </div>
          </StateForm>
        </div>
      </div>
    </AdminShell>
  );
}
