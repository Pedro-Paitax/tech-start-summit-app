/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
};

export default nextConfig;