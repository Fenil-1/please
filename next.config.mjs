/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>[^.]+).(sheetzu.com|localhost:3000|localhost)',
            },
          ],
          destination: '/',
        },
      ],
    }
  },
}

export default nextConfig
