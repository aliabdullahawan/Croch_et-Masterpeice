/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Add your Supabase storage domain here when configured:
      // { protocol: "https", hostname: "YOUR_PROJECT_ID.supabase.co" },
    ],
  },
};

module.exports = nextConfig;
