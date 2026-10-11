"use client";

import { useActionState } from "react";
import { usePathname } from "next/navigation";
import { subscribe, type SubscribeState } from "@/app/actions/public";
import { Icon } from "./caro";

export function SubscribeForm({ center = false, id = "sub" }: { center?: boolean; id?: string }) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null);
  const path = usePathname();
  if (state?.ok) {
    return (
      <p className="nl-sub__done" role="status">
        {state.message}
      </p>
    );
  }
  const err = state && !state.ok;
  return (
    <form action={action} className={`nl-sub${center ? " nl-sub--center" : ""}`}>
      <label className="sr-only" htmlFor={`${id}-email`}>
        Your email
      </label>
      <div className="nl-sub__row">
        <input
          id={`${id}-email`}
          className="nl-sub__input"
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          defaultValue={state?.email}
          aria-invalid={err ? true : undefined}
          aria-describedby={`${id}-note`}
        />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="ck-hp" aria-hidden="true" />
        <input type="hidden" name="source" value={path} />
        <button className="nl-btn nl-btn--lg" type="submit" disabled={pending}>
          <Icon name="mail" />
          <span>{pending ? "Subscribing…" : "Subscribe"}</span>
        </button>
      </div>
      <p id={`${id}-note`} className={`nl-sub__note${err ? " is-error" : ""}`} role={err ? "alert" : undefined}>
        {err ? state.message : "Free. One email a week. Leave any time."}
      </p>
    </form>
  );
}
