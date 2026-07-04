import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // middleware.ts matches /dashboard/:path*, so Next clones every request body
    // for the middleware to (potentially) read — capped separately from
    // serverActions.bodySizeLimit, and defaults to 10MB regardless of that setting.
    proxyClientMaxBodySize: "50mb",
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
