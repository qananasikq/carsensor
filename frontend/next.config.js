/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "*.carsensor.net" },
      { protocol: "https", hostname: "carsensor.net" },
      { protocol: "https", hostname: "*.cdn-carsensor.net" },
      { protocol: "https", hostname: "*.googlesyndication.com" },
      { protocol: "https", hostname: "placehold.co" }
    ]
  }
};

module.exports = nextConfig;
