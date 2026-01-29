import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com', // Vercel Blob
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai', // Pollinations AI (Fallback)
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com', // Unsplash (Legacy)
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Unsplash (Standard)
      }
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
