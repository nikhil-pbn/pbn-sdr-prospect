"use server";

import { redirect } from "next/navigation";
import { destroySession } from "./session";

/**
 * Sign out. A Server Action rather than a route so the button is a plain
 * `<form action={signOut}>` that works before any JavaScript has loaded.
 *
 * Redirects to `/`, which renders the sign-in screen once the cookie is gone.
 * `redirect()` signals by throwing, so nothing may follow it here.
 */
export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/");
}
