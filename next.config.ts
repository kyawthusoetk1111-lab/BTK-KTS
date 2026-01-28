import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Firebase Storage အတွက်
        port: '',
        pathname: '/v0/b/**',
      },
    ],
  },
  // Firebase error များ သက်သာစေရန် hydration warning ကို လျှော့ချခြင်း
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
