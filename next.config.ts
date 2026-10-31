import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.quran.app",
      },
      {
        protocol: "https",
        hostname: "android.quran.com",
      },
      {
        protocol: "https",
        hostname: "static.quran.com",
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
