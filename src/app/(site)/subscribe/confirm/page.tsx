import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site";
import { Head, Icon } from "@/components/caro";
import { getSettings } from "@/lib/settings";
import { confirmSubscriber, subscriberByToken } from "@/lib/subscribers";
import { sendMail, welcomeEmail } from "@/lib/email";

export const metadata: Metadata = { title: "Confirm", robots: { index: false } };

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const s = getSettings();
  const before = subscriberByToken(token);
  const sub = before ? confirmSubscriber(token) : null;
  if (before && before.status !== "active" && sub?.status === "active") {
    sendMail({ ...welcomeEmail(sub.token), to: sub.email }).catch((e) => console.error("welcome mail failed", e));
  }
  return (
    <PageShell label="Welcome" handle={s.handle} close={false}>
      <section className="ck-section ck-section--hero ck-message">
        <div className="ck-container ck-stack ck-stack--center" data-ck-reveal>
          {sub ? (
            <>
              <p className="kicker ck-kicker ck-fade">You’re in</p>
              <Head as="h1" size="display" first="Welcome aboard." second="See you this week." />
              <p className="lead ck-lead ck-fade">Your email is confirmed. The next issue lands in your inbox.</p>
            </>
          ) : (
            <>
              <p className="kicker ck-kicker ck-fade">Link expired</p>
              <Head as="h1" size="display" first="That link didn’t work." second="Try joining again." />
              <p className="lead ck-lead ck-fade">It may be old or copied in part. Join again and we’ll send a fresh one.</p>
            </>
          )}
          <div className="ck-actions ck-fade" style={{ justifyContent: "center" }}>
            <Link className="ck-link" href={sub ? "/issues" : "/#newsletter"}>
              {sub ? "Read past issues" : "Join the free newsletter"} <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
