import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    optimizePackageImports: ["@fortawesome/react-fontawesome", "@fortawesome/free-solid-svg-icons", "@fortawesome/free-brands-svg-icons"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/drirmbeo0/**",
      },
    ],
  },
};

export default nextConfig;
