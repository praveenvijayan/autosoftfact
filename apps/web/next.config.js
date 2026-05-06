/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@paraymd/db",
    "@paraymd/types",
    "@paraymd/utils",
    "@paraymd/api-client",
  ],
};

module.exports = nextConfig;
