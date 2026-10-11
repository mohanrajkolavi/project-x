import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site";
import { subscriberByToken } from "@/lib/subscribers";
import { resubscribeAction, unsubscribeAction } from "./actions";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

type Props = { searchParams: Promise<{ token?: string; done?: string }> };

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token = "", done } = await searchParams;
  const sub = subscriberByToken(token);

  let body;
  if (!sub) {
    body = (
      <>
        <p className="nl-kicker" style={{ marginBottom: 12 }}>Unsubscribe</p>
        <h1 className="nl-h1">We couldn’t find you. <span className="nl-sec">Use the link in an email.</span></h1>
        <p className="nl-lead">Every issue ends with a one-click unsubscribe link. Open it from there.</p>
      </>
    );
  } else if (sub.status === "unsubscribed") {
    body = (
      <>
        <p className="nl-kicker" style={{ marginBottom: 12 }}>{done === "1" ? "Done" : "Unsubscribed"}</p>
        <h1 className="nl-h1">You’re off the list. <span className="nl-sec">No more emails.</span></h1>
        <p className="nl-lead">Changed your mind? Join again with one tap.</p>
        <form action={resubscribeAction} className="nl-message__actions">
          <input type="hidden" name="token" value={token} />
          <button className="nl-btn nl-btn--lg" type="submit">
            Subscribe again
          </button>
        </form>
      </>
    );
  } else {
    body = (
      <>
        <p className="nl-kicker" style={{ marginBottom: 12 }}>Unsubscribe</p>
        <h1 className="nl-h1">Leaving so soon? <span className="nl-sec">One tap and you’re out.</span></h1>
        <p className="nl-lead">
          This stops every email to <span className="ck-nb">{sub.email}</span>.
        </p>
        <form action={unsubscribeAction} className="nl-message__actions">
          <input type="hidden" name="token" value={token} />
          <button className="nl-btn nl-btn--lg nl-btn--ghost" type="submit">
            Unsubscribe me
          </button>
          <Link className="nl-btn nl-btn--lg" href="/">
            Stay subscribed
          </Link>
        </form>
      </>
    );
  }

  return (
    <PageShell cta={false}>
      <div className="nl-read nl-message">
        <div>{body}</div>
      </div>
    </PageShell>
  );
}
