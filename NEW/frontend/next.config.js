/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',

  // Environment variables accessible on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80/api',
  },

  // Configure for Docker
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig
