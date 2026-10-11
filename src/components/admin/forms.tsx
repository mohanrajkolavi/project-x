"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/admin/actions";

export function Flash({ state }: { state: FormState }) {
  if (!state || (!state.error && !state.message)) return null;
  return (
    <p className={`ad-flash${state.error ? " is-error" : ""}`} role={state.error ? "alert" : "status"}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {state.error ? <path d="M12 7v6M12 17h.01" /> : <path d="M6 12.5l4 4 8-9" />}
      </svg>
      {state.error || state.message}
    </p>
  );
}

/** A form bound to a server action that returns FormState; shows the result above the fields. */
export function StateForm({
  action,
  children,
  className = "ad-form",
  resetOnSuccess = false,
  encType,
}: {
  action: (p: FormState, f: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  encType?: "multipart/form-data";
}) {
  const [state, run] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (resetOnSuccess && state?.ok) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={run} className={className} encType={encType}>
      <Flash state={state} />
      {children}
    </form>
  );
}

export function Submit({ children, primary = false, small = false, pendingText }: { children: ReactNode; primary?: boolean; small?: boolean; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={`ad-btn${primary ? " ad-btn--primary" : ""}${small ? " ad-btn--small" : ""}`} type="submit" disabled={pending}>
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

/** A small button that asks before it runs a destructive server action. */
export function ConfirmButton({
  action,
  fields,
  label,
  question,
  danger = true,
  text = false,
}: {
  action: (f: FormData) => Promise<void>;
  fields: Record<string, string | number>;
  label: string;
  question: string;
  danger?: boolean;
  text?: boolean;
}) {
  return (
    <form
      action={action}
      className="ad-inline-form"
      onSubmit={(e) => {
        if (!window.confirm(question)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button className={`ad-btn ad-btn--small${danger ? " ad-btn--danger" : ""}${text ? " ad-btn--text" : ""}`} type="submit">
        {label}
      </button>
    </form>
  );
}
