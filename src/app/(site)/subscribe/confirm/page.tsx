import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site";
import { confirmSubscriber, subscriberByToken } from "@/lib/subscribers";
import { sendMail, welcomeEmail } from "@/lib/email";

export const metadata: Metadata = { title: "Confirm", robots: { index: false } };

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const before = subscriberByToken(token);
  const sub = before ? confirmSubscriber(token) : null;
  if (before && before.status !== "active" && sub?.status === "active") {
    sendMail({ ...welcomeEmail(sub.token), to: sub.email }).catch((e) => console.error("welcome mail failed", e));
  }
  return (
    <PageShell cta={false}>
      <div className="nl-read nl-message">
        <div>
          <p className="nl-kicker" style={{ marginBottom: 12 }}>
            {sub ? "You’re in" : "Link expired"}
          </p>
          <h1 className="nl-h1">{sub ? "Welcome aboard." : "That link didn’t work."}</h1>
          <p className="nl-lead">{sub ? "Your email is confirmed. The next issue lands in your inbox." : "It may be old or copied in part. Subscribe again and we’ll send a fresh one."}</p>
          <div className="nl-message__actions">
            <Link className="nl-btn nl-btn--lg" href={sub ? "/issues" : "/subscribe"}>
              {sub ? "Read past issues" : "Subscribe again"}
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
