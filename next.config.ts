import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // archiver loads its format plugins dynamically; keep it external so the
  // server bundler doesn't try to trace/inline those requires.
  serverExternalPackages: ['archiver'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-80f17c46cf88433cb27a022bbe2a5b95.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
