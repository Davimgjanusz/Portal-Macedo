/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  cacheComponents: true,
  partialPrefetching: true,
<<<<<<< HEAD
=======
  serverExternalPackages: ['pdfkit'],
>>>>>>> master
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
