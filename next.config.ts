import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // @ts-ignore - ESLint config for build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;