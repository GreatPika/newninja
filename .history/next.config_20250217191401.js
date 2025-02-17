/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {}, // Это ожидает объект, даже если параметры внутри не используются
  },
  reactStrictMode: true,
  transpilePackages: ['rimraf'], // Добавлено, чтобы Next.js обрабатывал пакет rimraf
};

module.exports = nextConfig;