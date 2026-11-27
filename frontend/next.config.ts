import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/admin/login', destination: '/admin/dang-nhap', permanent: false },
      { source: '/admin/appointments', destination: '/admin/lich-hen', permanent: false },
      { source: '/admin/dresses', destination: '/admin/vay-cuoi', permanent: false },
      { source: '/admin/services', destination: '/admin/dich-vu', permanent: false },
      { source: '/admin/posts', destination: '/admin/tap-chi', permanent: false },
      { source: '/admin/banners', destination: '/admin/banner', permanent: false },
      { source: '/admin/settings', destination: '/admin/cau-hinh', permanent: false },
    ];
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
