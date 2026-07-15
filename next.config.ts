import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker(standalone) 배포를 위한 최소 서버 번들 출력
  output: "standalone",
  reactCompiler: true,
};

export default nextConfig;
