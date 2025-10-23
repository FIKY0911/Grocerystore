import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns:[{
      protocol: 'https',
      hostname: 'cdn.sanity.io'
    }],
  },

  allowedDevOrigins: [
    'dernier-potentially-collins.ngrok-free.dev',
  ]
};

export default nextConfig;
