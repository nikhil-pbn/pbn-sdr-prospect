import Link from "next/link";
import { ShieldX, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PbnLogo } from "@/components/brand/pbn-logo";

/**
 * The shared refusal card: signed in, but not allowed here. Defaults describe
 * the admin-only case (Steps 4–5); `NoSdrAccess` reuses the frame for the SDR
 * list with its own words and its own way out.
 */
export function NoAccess({
  icon: Icon = ShieldX,
  title = "You don't have access to this",
  detail = "This page is limited to administrators. You're signed in — this account just isn't on the list.",
  children,
}: {
  icon?: LucideIcon;
  title?: string;
  detail?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center shadow-sm">
        <PbnLogo size="lg" eager />

        <span
          aria-hidden
          className="mx-auto mt-7 grid size-10 place-items-center rounded-full bg-muted"
        >
          <Icon className="size-5 text-muted-foreground" />
        </span>

        <h1 className="mt-5 text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>

        {children ?? (
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link href="/">Back to the prospect builder</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
