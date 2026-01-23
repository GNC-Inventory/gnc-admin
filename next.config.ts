import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' completely
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;