import "server-only";
import { revalidatePath } from "next/cache";
import { editorPathFor, prospectPathFor } from "@/utils/prospect-url";

/**
 * Every page that shows a prospect goes stale on any write to it. One list, so
 * a page added later is invalidated by every write rather than by whichever
 * mutation remembered it.
 */
export function revalidateProspect(id: string, slug: string): void {
  revalidatePath(editorPathFor(id));
  revalidatePath(prospectPathFor(slug));
  revalidatePath("/");
  revalidatePath("/my-prospects");
  revalidatePath("/all-prospects");
}
