import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Turbopack optimizations
  },
};

export default nextConfig;
