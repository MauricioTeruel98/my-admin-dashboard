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
};

export default nextConfig;
