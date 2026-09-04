import { LogOut, UserRoundX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/server/auth/actions";
import { accessRequestContact } from "@/server/auth/admin";
import { NoAccess } from "./no-access";

/**
 * Shown to a signed-in employee who is not on `SDR_ACCESS_EMAILS`.
 *
 * Its own screen rather than the admin refusal reworded, because the situation
 * is not the same one. Missing from the SDR list is usually an oversight — a
 * new starter, or a second work account — so this names the address that was
 * refused and who can add it. Without the address on screen there is no way to
 * tell which of two work accounts is signed in, which is the most common cause.
 *
 * "Back to the builder" would be a dead end here: the builder is the page that
 * just refused them. Signing out is the only action that can change the answer.
 */
export function NoSdrAccess({ email }: { email: string }) {
  const contact = accessRequestContact();

  return (
    <NoAccess
      icon={UserRoundX}
      title="You're not on the SDR team list"
      detail="This tool is limited to the SDR team, and this address hasn't been added to it yet. A published prospect's own page is public and needs no account — but everything inside here does."
    >
      <p className="mt-5 w-full truncate rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>

      <p className="mt-3 text-xs text-muted-foreground">
        {contact
          ? `Ask ${contact} to add it, then sign in again.`
          : "Ask whoever set this tool up to add it, then sign in again."}
      </p>

      <form action={signOut} className="mt-4 w-full">
        <Button type="submit" variant="outline" className="w-full">
          <LogOut className="size-4" />
          Sign out
        </Button>
      </form>
    </NoAccess>
  );
}
