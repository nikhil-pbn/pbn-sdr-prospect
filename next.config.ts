import type { NextConfig } from "next";

/**
 * Empty on purpose. Authentication needs no config, and nothing here should be
 * added speculatively — the public prospect page (Step 2) decides its own
 * image and redirect settings when it exists.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
