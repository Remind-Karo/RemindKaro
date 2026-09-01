import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    const backendUrl = (rawUrl && rawUrl !== '' ? rawUrl : 'http://localhost:5000').replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
// Trigger Vercel rebuild for env vars
