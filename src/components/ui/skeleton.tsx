import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A grey block standing in for a value that is still loading.
 *
 * shadcn's `Skeleton`, on this project's `bg-muted` so it matches the ones the
 * homepage already draws by hand. Give it the height and roughly the width of
 * the value it replaces: a placeholder should read as "a value goes here", and
 * the page should not move when the value arrives.
 *
 * Hidden from assistive tech — the container announces the loading, not each
 * grey bar.
 */
function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
