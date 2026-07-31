import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals ?? [];
      config.externals.push("better-sqlite3", "@prisma/adapter-better-sqlite3");
    }
    return config;
  },
};

export default nextConfig;
