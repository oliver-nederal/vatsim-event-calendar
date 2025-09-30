import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vatsim-my.nyc3.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
      // Add other potential VATSIM image domains
      {
        protocol: 'https',
        hostname: 'my.vatsim.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vatsim.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
