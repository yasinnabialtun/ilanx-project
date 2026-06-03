import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Add rewrites so old /editor links point to the new AI Video Studio
  async rewrites() {
    return [
      {
        source: '/editor',
        destination: '/ai-video',
      },
    ];
  },
};

export default nextConfig;
