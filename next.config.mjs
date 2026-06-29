/** @type {import('next').Next.jsConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/group",
        destination: "/pricing",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
