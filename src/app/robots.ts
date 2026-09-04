import type { MetadataRoute } from "next";

/**
 * Internal tool: keep every crawler out. When the public prospect page lands
 * (Step 2, `/[slug]`) this is where its allow rule goes — until then there is
 * nothing on this domain a search engine should see.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
