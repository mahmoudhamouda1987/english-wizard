import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only origin allow-list. Next 16.3's automatic origin check can 403
  // same-origin chunk requests when only the hostname is inferred, so both
  // local hostnames are listed explicitly. No effect in production builds.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    root: __dirname,
  },
  // Runtime schema self-healing reads db/schema.sql from the deployed
  // functions (src/infrastructure/database.ts ensureSchema). Tracing it here
  // guarantees the file ships inside serverless bundles on Vercel.
  outputFileTracingIncludes: {
    "/api/**": ["./db/schema.sql"],
  },
};

export default nextConfig;
