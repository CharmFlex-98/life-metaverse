import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    SERVER_DOMAIN: process.env.SERVER_DOMAIN,
  },
};

export default nextConfig;
