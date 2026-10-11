import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { StateForm, Submit } from "@/components/admin/forms";
import { Head } from "@/components/caro";
import { userCount } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { setupOwner } from "../actions";

export const metadata: Metadata = { title: "Set up", robots: { index: false } };

export default function SetupPage() {
  if (userCount() > 0) redirect("/admin/login");
  return (
    <AdminShell handle={getSettings().handle} label="Setup">
      <div className="ad-auth">
        <div className="ad-auth__box">
          <p className="kicker ck-kicker">First run</p>
          <Head as="h1" size="headline" first="Make your account." second="Then start writing." words={false} />
          <p className="ad-sub">This account owns the site. You can add editors later.</p>
          <StateForm action={setupOwner}>
            <div className="ad-field">
              <label htmlFor="name">Your name</label>
              <input className="ad-input" id="name" name="name" autoComplete="name" required autoFocus />
            </div>
            <div className="ad-field">
              <label htmlFor="email">Email</label>
              <input className="ad-input" id="email" name="email" type="email" autoComplete="username" required />
            </div>
            <div className="ad-field">
              <label htmlFor="password">Password</label>
              <input className="ad-input" id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
              <p className="ad-hint">At least 10 characters.</p>
            </div>
            <label className="ad-check">
              <input type="checkbox" name="samples" defaultChecked />
              <span>
                <b>Add 3 sample issues.</b> Shows how each block looks. Delete them any time.
              </span>
            </label>
            <label className="ad-check">
              <input type="checkbox" name="demo" />
              <span>
                <b>Add demo readers and traffic.</b> Fake numbers with example.com addresses, to try the dashboard. Leave off for a real launch.
              </span>
            </label>
            <div className="ad-form-actions">
              <Submit primary pendingText="Setting up…">Create account</Submit>
            </div>
          </StateForm>
        </div>
      </div>
    </AdminShell>
  );
}
