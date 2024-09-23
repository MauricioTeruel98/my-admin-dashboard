/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true, // Si quieres hacer una redirección permanente (301)
      },
    ];
  },
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
