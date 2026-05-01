import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "robu.in" },
      { protocol: "https", hostname: "store.arduino.cc" },
      { protocol: "https", hostname: "www.raspberrypi.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Suppress hydration warnings from browser extensions
  reactStrictMode: true,
};

export default nextConfig;
