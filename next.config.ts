import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable turbopack for development
  // Configured via --turbopack flag in dev script

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Server external packages (Prisma needs this)
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
