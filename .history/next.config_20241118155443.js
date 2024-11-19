/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      turbo: {}, // Это ожидает объект, даже если параметры внутри не используются
    },
    reactStrictMode: true,
    // Дополнительные настройки
  };
  
  module.exports = nextConfig;
  