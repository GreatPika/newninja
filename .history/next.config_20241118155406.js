/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      turbo: {
        resolveAlias: true, // включение Turbopack с настройками по умолчанию
      },
    },
    reactStrictMode: true,
  };
  
  module.exports = nextConfig;
  