import Link from "next/link";
import { PageShell } from "@/components/site";

export default function NotFound() {
  return (
    <PageShell palette="twilight" hero="white" cta={false}>
      <div className="nl-read nl-message">
        <div>
          <p className="nl-big-num ck-hero">404</p>
          <h1 className="nl-h1">This page isn’t here.</h1>
          <p className="nl-lead">It may have moved, or the link has a typo.</p>
          <div className="nl-message__actions">
            <Link className="nl-btn nl-btn--lg" href="/">
              Go home
            </Link>
            <Link className="nl-btn nl-btn--lg nl-btn--ghost" href="/issues">
              Browse the archive
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
