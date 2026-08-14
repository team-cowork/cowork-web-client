import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "ssh.gsmsv.site", port: "22108" },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
