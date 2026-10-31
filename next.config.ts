import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root so Next.js ignores stray lockfiles in parent folders
  turbopack: { root: process.cwd() },

  async headers() {
    return [
      {
        // Browsers must always re-check the service worker file for updates
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
