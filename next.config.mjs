/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow accessing the dev server from your LAN IP without CORS warnings
  allowedDevOrigins: [
    'http://10.152.0.177:3000',
  ],
}

export default nextConfig
