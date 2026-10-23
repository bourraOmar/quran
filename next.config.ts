import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/downloads/uns-quran.apk",
        destination: "https://github.com/bourraOmar/uns-app/releases/download/v1.0.0/uns-quran.apk",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
