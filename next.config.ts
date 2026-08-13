import type { NextConfig } from "next";
import path from "path";

const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://my-next-js-restaurant-lnc6.vercel.app").replace(/\/+$/, "");
const API_URL = rawApiUrl;
let apiHost = "localhost";
let apiPort = "5000";
let apiOrigin = "https://my-next-js-restaurant-lnc6.vercel.app";

try {
  const parsed = new URL(API_URL);
  apiHost = parsed.hostname;
  apiPort = parsed.port;
  apiOrigin = parsed.origin;
} catch {
  // Fallback
}

const connectOrigins = Array.from(
  new Set([
    "'self'",
    "http://localhost:5000",
    "https://my-next-js-restaurant-lnc6.vercel.app",
    apiOrigin,
    "https://*.vercel.app",
    "https://api.razorpay.com",
    "https://lumberjack.razorpay.com",
    "https://checkout.razorpay.com",
  ])
).join(" ");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: apiPort || "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: apiPort || "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: apiHost,
        port: apiPort || "5000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },

  compress: true,
  poweredByHeader: false,

  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${API_URL}/uploads/:path*`,
      },
      {
        source: "/admin/:path*",
        destination: `${API_URL}/uploads/:path*`,
      },
    ];
  },

  async headers() {
    if (process.env.NODE_ENV === "development") {
      return [];
    }

    return [
      {
        source: "/((?!_next/static).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
              "frame-src 'self' https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: http: https:",
              `connect-src ${connectOrigins}`,
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
    ];
  },

  async redirects() {
    return process.env.NODE_ENV === "production"
      ? [
          {
            source: "/(.*)",
            has: [{ type: "host", value: "www.letoiledoree.com" }],
            destination: "https://letoiledoree.com/:path*",
            permanent: true,
          },
        ]
      : [];
  },
};

export default nextConfig;
