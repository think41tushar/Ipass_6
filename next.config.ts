import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "icons8.com",
      },
    ],
  },
};

export default nextConfig;
