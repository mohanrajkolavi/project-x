import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth";
import { envLocked, getSettings } from "@/lib/settings";
import { smtpReady } from "@/lib/email";
import { StateForm, Submit } from "@/components/admin/forms";
import { saveSettingsAction, testMail } from "../../actions";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireOwner();
  const s = getSettings();
  const locked = new Set(envLocked());
  const lock = (k: Parameters<typeof locked.has>[0]) => (locked.has(k) ? { readOnly: true, title: "Set by an environment variable" } : {});
  const envNote = (k: Parameters<typeof locked.has>[0]) => (locked.has(k) ? <p className="ad-hint">Set by an environment variable on the server.</p> : null);

  return (
    <>
      <div className="ad-head">
        <div>
          <p className="kicker ck-kicker">Owner only</p>
          <h1 className="ad-title">Settings.</h1>
          <p className="ad-sub">How the site introduces itself, and how email goes out.</p>
        </div>
      </div>

      <StateForm action={saveSettingsAction} className="ad-form" >
        <fieldset className="ad-fieldset" style={{ borderTop: 0, paddingTop: 0 }}>
          <legend>Site</legend>
          <div className="ad-row-2">
            <div className="ad-field">
              <label htmlFor="siteName">Site name</label>
              <input className="ad-input" id="siteName" name="siteName" defaultValue={s.siteName} required />
              <p className="ad-hint">Used in browser tabs, search results and the feed.</p>
            </div>
            <div className="ad-field">
              <label htmlFor="handle">Handle</label>
              <input className="ad-input" id="handle" name="handle" defaultValue={s.handle} required />
              <p className="ad-hint">Shown next to the planet avatar in the header.</p>
            </div>
          </div>
          <div className="ad-field">
            <label htmlFor="siteDescription">Description</label>
            <input className="ad-input" id="siteDescription" name="siteDescription" defaultValue={s.siteDescription} />
          </div>
          <div className="ad-field">
            <label htmlFor="siteUrl">Site address</label>
            <input className="ad-input" id="siteUrl" name="siteUrl" type="url" defaultValue={s.siteUrl} placeholder="https://example.com" {...lock("siteUrl")} />
            {envNote("siteUrl") || <p className="ad-hint">Used for links in emails and the feed. Set it before your first send.</p>}
          </div>
        </fieldset>

        <fieldset className="ad-fieldset" id="mail">
          <legend>Email</legend>
          <p className="ad-note">
            {smtpReady() ? (
              <>
                <b>Mail server ready.</b> Emails go out through {s.smtpHost}.
              </>
            ) : (
              <>
                <b>No mail server yet.</b> Emails wait in the outbox. Any SMTP service works, like the one your email provider or a sending service gives you.
              </>
            )}
          </p>
          <div className="ad-row-2">
            <div className="ad-field">
              <label htmlFor="fromName">From name</label>
              <input className="ad-input" id="fromName" name="fromName" defaultValue={s.fromName} />
            </div>
            <div className="ad-field">
              <label htmlFor="fromEmail">From address</label>
              <input className="ad-input" id="fromEmail" name="fromEmail" type="email" defaultValue={s.fromEmail} placeholder="hello@example.com" {...lock("fromEmail")} />
              {envNote("fromEmail")}
            </div>
          </div>
          <div className="ad-row-3">
            <div className="ad-field">
              <label htmlFor="smtpHost">SMTP host</label>
              <input className="ad-input" id="smtpHost" name="smtpHost" defaultValue={s.smtpHost} placeholder="smtp.example.com" {...lock("smtpHost")} />
            </div>
            <div className="ad-field">
              <label htmlFor="smtpPort">Port</label>
              <input className="ad-input" id="smtpPort" name="smtpPort" inputMode="numeric" defaultValue={s.smtpPort} {...lock("smtpPort")} />
            </div>
            <div className="ad-field">
              <label htmlFor="smtpUser">Username</label>
              <input className="ad-input" id="smtpUser" name="smtpUser" defaultValue={s.smtpUser} autoComplete="off" {...lock("smtpUser")} />
            </div>
          </div>
          <div className="ad-row-2">
            <div className="ad-field">
              <label htmlFor="smtpPass">Password</label>
              <input className="ad-input" id="smtpPass" name="smtpPass" type="password" autoComplete="new-password" placeholder={s.smtpPass ? "Saved. Type to replace." : ""} {...lock("smtpPass")} />
              {locked.has("smtpPass") ? envNote("smtpPass") : s.smtpPass ? (
                <label className="ad-check">
                  <input type="checkbox" name="clearPass" /> <span>Remove the saved password</span>
                </label>
              ) : null}
            </div>
            <div className="ad-field">
              <span className="ad-label">Security</span>
              <label className="ad-check">
                <input type="checkbox" name="smtpSecure" defaultChecked={s.smtpSecure === "true"} />
                <span>
                  <b>Use TLS from the start.</b> Usually on for port 465, off for 587.
                </span>
              </label>
            </div>
          </div>
          <label className="ad-check">
            <input type="checkbox" name="doubleOptIn" defaultChecked={s.doubleOptIn !== "false"} />
            <span>
              <b>Ask new subscribers to confirm.</b> They get an email with a link first. This keeps fake signups and typos off your list.
            </span>
          </label>
        </fieldset>

        <fieldset className="ad-fieldset">
          <legend>About page</legend>
          <div className="ad-field">
            <label htmlFor="about">Body</label>
            <textarea className="ad-textarea ad-textarea--code" id="about" name="about" defaultValue={s.about} style={{ minHeight: 360 }} />
            <p className="ad-hint">Written the same way as an issue body. Use --- between sections.</p>
          </div>
        </fieldset>

        <div className="ad-form-actions">
          <Submit primary pendingText="Saving…">Save settings</Submit>
        </div>
      </StateForm>

      <section className="ad-section">
        <div className="ad-section__head">
          <h2>Check the mail server</h2>
        </div>
        <StateForm action={testMail} className="ad-form ad-form--narrow">
          <p className="ad-hint">Sends a short test to your own address. Save your settings first.</p>
          <div className="ad-form-actions">
            <Submit pendingText="Sending…">Send a test email</Submit>
          </div>
        </StateForm>
      </section>
    </>
  );
}
