import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'ssh.gsmsv.site', port: '22108' },
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      // 프로모션 화면의 팀원 GitHub 프로필 사진
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      // 게이트웨이를 거쳐 내려오는 presigned 스토리지 URL
      {
        protocol: 'https',
        hostname: 'cowork.https.gsmsv.site',
        pathname: '/api/storage/**',
      },
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
