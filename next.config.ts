import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      // 게이트웨이 아래 다른 경로를 이미지 최적화 서버가 대신 가져오지 않도록 스토리지 경로로 한정한다.
      {
        protocol: 'http',
        hostname: 'ssh.gsmsv.site',
        port: '22108',
        pathname: '/api/storage/**',
      },
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      // 프로모션 화면의 팀원 GitHub 프로필 사진
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    // localhost는 사설 IP로 리졸브되어 기본적으로 이미지 옵티마이저가 SSRF 방지 차원에서 차단한다.
    // 로컬 MinIO(9000)를 쓰는 개발 환경에서만 허용하고, production은 원격 호스트만 쓰므로 그대로 둔다.
    ...(process.env.NODE_ENV !== 'production'
      ? { dangerouslyAllowLocalIP: true }
      : {}),
  },
  reactCompiler: true,
};

export default nextConfig;
