import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site";
import { Head, Icon } from "@/components/caro";
import { getSettings } from "@/lib/settings";
import { subscriberByToken } from "@/lib/subscribers";
import { resubscribeAction, unsubscribeAction } from "./actions";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

type Props = { searchParams: Promise<{ token?: string; done?: string }> };

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token = "", done } = await searchParams;
  const s = getSettings();
  const sub = subscriberByToken(token);

  let body;
  if (!sub) {
    body = (
      <>
        <p className="kicker ck-kicker ck-fade">Unsubscribe</p>
        <Head as="h1" size="display" first="We couldn’t find you." second="Use the link in an email." />
        <p className="lead ck-lead ck-fade">Every issue ends with a one-click unsubscribe link. Open it from there.</p>
      </>
    );
  } else if (sub.status === "unsubscribed") {
    body = (
      <>
        <p className="kicker ck-kicker ck-fade">{done === "1" ? "Done" : "Unsubscribed"}</p>
        <Head as="h1" size="display" first="You’re off the list." second="No more emails." />
        <p className="lead ck-lead ck-fade">Changed your mind? Join again with one tap.</p>
        <form action={resubscribeAction} className="ck-actions ck-fade" style={{ justifyContent: "center" }}>
          <input type="hidden" name="token" value={token} />
          <button className="ck-link" type="submit" style={{ background: "none", border: 0, font: "inherit", cursor: "pointer" }}>
            Join again <Icon name="arrow" />
          </button>
        </form>
      </>
    );
  } else {
    body = (
      <>
        <p className="kicker ck-kicker ck-fade">Unsubscribe</p>
        <Head as="h1" size="display" first="Leaving so soon?" second="One tap and you’re out." />
        <p className="lead ck-lead ck-fade">
          This stops every email to <span className="ck-nb">{sub.email}</span>.
        </p>
        <form action={unsubscribeAction} className="ck-actions ck-fade" style={{ justifyContent: "center" }}>
          <input type="hidden" name="token" value={token} />
          <button className="ad-btn" type="submit">
            Unsubscribe me
          </button>
          <Link className="ck-link" href="/">
            Stay subscribed <Icon name="arrow" />
          </Link>
        </form>
      </>
    );
  }

  return (
    <PageShell label="Settings" handle={s.handle} close={false}>
      <section className="ck-section ck-section--hero ck-message">
        <div className="ck-container ck-stack ck-stack--center" data-ck-reveal>
          {body}
        </div>
      </section>
    </PageShell>
  );
}
