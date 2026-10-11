"use client";

import { useActionState } from "react";
import { usePathname } from "next/navigation";
import { subscribe, type SubscribeState } from "@/app/actions/public";
import { Icon } from "./caro";

export function SubscribeForm({ center = true }: { center?: boolean }) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null);
  const path = usePathname();
  if (state?.ok) {
    return (
      <p className="result ck-result ck-sub__done" role="status">
        {state.message}
      </p>
    );
  }
  return (
    <form action={action} className={`ck-sub${center ? " ck-sub--center" : ""}`} noValidate={false}>
      <label className="ck-sub__label fine" htmlFor="sub-email">
        Your email
      </label>
      <div className="ck-sub__row">
        <input
          id="sub-email"
          className="ck-sub__input"
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          defaultValue={state?.email}
          aria-invalid={state && !state.ok ? true : undefined}
          aria-describedby={state && !state.ok ? "sub-msg" : undefined}
        />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="ck-hp" aria-hidden="true" />
        <input type="hidden" name="source" value={path} />
        <button className="ck-capsule is-pulsing" type="submit" disabled={pending}>
          <Icon name="mail" />
          <span>Join the free newsletter</span>
        </button>
      </div>
      {state && !state.ok ? (
        <p id="sub-msg" className="fine ck-sub__error" role="alert">
          {state.message}
        </p>
      ) : (
        <p className="fine ck-sub__note">Free. One email a week. Leave any time.</p>
      )}
    </form>
  );
}
