/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Разрешаем отдачу изображений напрямую из Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {},
};

export default nextConfig;
