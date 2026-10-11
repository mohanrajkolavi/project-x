import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { shortDate } from "@/lib/format";
import { ConfirmButton, StateForm, Submit } from "@/components/admin/forms";
import { addMember, changePassword, removeMember } from "../../actions";

export const metadata: Metadata = { title: "Team" };

type Member = { id: number; name: string; email: string; role: string; created_at: string };

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const me = await requireUser();
  const sp = await searchParams;
  const team = db().prepare("SELECT id, name, email, role, created_at FROM users ORDER BY role DESC, created_at").all() as Member[];
  const owner = me.role === "owner";
  return (
    <>
      <div className="ad-head">
        <div>
          <p className="kicker ck-kicker">People</p>
          <h1 className="ad-title">Team.</h1>
          <p className="ad-sub">Owners run settings and the team. Editors write, publish and send.</p>
        </div>
      </div>
      {sp.error === "self" ? <p className="ad-flash is-error" role="alert">You can’t remove yourself.</p> : null}
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Since</th>
              <th className="actions">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.id}>
                <td className="main">
                  {m.name} {m.id === me.id ? <span className="ad-muted">(you)</span> : null}
                  <span className="sub">{m.email}</span>
                </td>
                <td>{m.role === "owner" ? "Owner" : "Editor"}</td>
                <td>{shortDate(m.created_at)}</td>
                <td className="actions">
                  {owner && m.id !== me.id ? (
                    <ConfirmButton action={removeMember} fields={{ id: m.id }} label="Remove" question={`Remove ${m.name}? They’ll be signed out.`} text />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ad-grid-2 ad-section">
        {owner ? (
          <section>
            <div className="ad-section__head">
              <h2>Add someone</h2>
            </div>
            <StateForm action={addMember} resetOnSuccess>
              <div className="ad-row-2">
                <div className="ad-field">
                  <label htmlFor="m-name">Name</label>
                  <input className="ad-input" id="m-name" name="name" required />
                </div>
                <div className="ad-field">
                  <label htmlFor="m-role">Role</label>
                  <select className="ad-select" id="m-role" name="role" defaultValue="editor">
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </div>
              <div className="ad-field">
                <label htmlFor="m-email">Email</label>
                <input className="ad-input" id="m-email" name="email" type="email" required />
              </div>
              <div className="ad-field">
                <label htmlFor="m-pass">First password</label>
                <input className="ad-input" id="m-pass" name="password" type="text" minLength={10} required autoComplete="off" />
                <p className="ad-hint">Share it with them privately. They can change it here after signing in.</p>
              </div>
              <div className="ad-form-actions">
                <Submit pendingText="Adding…">Add to team</Submit>
              </div>
            </StateForm>
          </section>
        ) : null}
        <section>
          <div className="ad-section__head">
            <h2>Your password</h2>
          </div>
          <StateForm action={changePassword} resetOnSuccess>
            <input type="hidden" name="username" autoComplete="username" value={me.email} />
            <div className="ad-field">
              <label htmlFor="cur">Current password</label>
              <input className="ad-input" id="cur" name="current" type="password" autoComplete="current-password" required />
            </div>
            <div className="ad-field">
              <label htmlFor="next">New password</label>
              <input className="ad-input" id="next" name="next" type="password" autoComplete="new-password" minLength={10} required />
            </div>
            <div className="ad-form-actions">
              <Submit pendingText="Saving…">Change password</Submit>
            </div>
          </StateForm>
        </section>
      </div>
    </>
  );
}
