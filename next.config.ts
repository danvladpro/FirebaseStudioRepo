import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },

  // ✅ Moved out of "experimental"
  allowedDevOrigins: ['https://*.cloudworkstations.dev', 'http://localhost:9002', 'http://localhost:9000'],

  // ✅ Removed deprecated "devIndicators"
  experimental: {},
};

export default nextConfig;
