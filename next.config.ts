import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma client uses dynamic path.join / fs reads at module load time.
  // Externalize it so Next.js / Turbopack does not trace the whole project.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
