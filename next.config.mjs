/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  async redirects() {
    return [
      { source: '/center', destination: '/shop-owner', permanent: false },
      { source: '/center/booths', destination: '/shop-owner/booths', permanent: false },
      { source: '/center/analytics', destination: '/shop-owner/analytics', permanent: false },
      { source: '/saas', destination: '/admin', permanent: false },
      { source: '/saas/monetization', destination: '/admin/monetization', permanent: false },
      { source: '/saas/shops', destination: '/admin/shops', permanent: false },
      { source: '/website', destination: '/', permanent: false },
    ];
  },
};

export default nextConfig;
