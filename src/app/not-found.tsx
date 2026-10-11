import Link from "next/link";
import { PageShell } from "@/components/site";
import { Head, Icon } from "@/components/caro";
import { getSettings } from "@/lib/settings";

export default function NotFound() {
  const s = getSettings();
  return (
    <PageShell label="Lost" handle={s.handle} palette="twilight" hero="white" close={false}>
      <section className="ck-section ck-section--hero ck-message">
        <div className="ck-container ck-stack ck-stack--center" data-ck-reveal>
          <div className="ck-numeral" data-ck-orbits>
            <span className="hero ck-hero">404</span>
          </div>
          <Head as="h1" size="display" first="Lost in space." second="This page isn’t here." />
          <div className="ck-actions ck-fade" style={{ justifyContent: "center" }}>
            <Link className="ck-link" href="/issues">
              Browse every issue <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
