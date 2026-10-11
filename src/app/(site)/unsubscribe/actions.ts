"use server";

import { redirect } from "next/navigation";
import { subscriberByToken, unsubscribe, upsertSubscriber } from "@/lib/subscribers";

export async function unsubscribeAction(form: FormData) {
  const token = String(form.get("token") || "");
  unsubscribe(token);
  redirect(`/unsubscribe?token=${encodeURIComponent(token)}&done=1`);
}

export async function resubscribeAction(form: FormData) {
  const token = String(form.get("token") || "");
  const s = subscriberByToken(token);
  // The token proves they own the address, so no second confirmation is needed.
  if (s) upsertSubscriber(s.email, "Rejoined", false);
  redirect(`/unsubscribe?token=${encodeURIComponent(token)}`);
}
