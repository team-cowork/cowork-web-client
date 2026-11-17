import type { Metadata } from 'next';

export const SITE_NAME = 'cowork';
export const SITE_DESCRIPTION =
  '광주소프트웨어마이스터고등학교 학생들이 만드는 협업 관리 플랫폼';

/** 공유 미리보기 이미지(1200×630). 원본: cowork-promotion/social-card.png */
export const SOCIAL_IMAGE = {
  url: '/promotion/social-card.png',
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_DESCRIPTION}`,
};

/**
 * og 이미지·canonical을 전체 주소로 만들 공개 origin. 정적 페이지는 빌드 때 만들어지므로
 * 빌드 환경에도 APP_ORIGIN이 있어야 한다. 없으면 Next.js가 localhost로 대신한다.
 */
export const SITE_ORIGIN = process.env.APP_ORIGIN
  ? new URL(process.env.APP_ORIGIN)
  : undefined;

/**
 * 로그인 없이 보는 공개 페이지의 메타데이터. canonical과 og:url을 그 페이지 경로로 정한다.
 * 페이지의 openGraph는 상위 값을 통째로 덮으므로 공유 이미지도 여기서 다시 넣는다.
 */
export function publicPageMetadata({
  title,
  description,
  path,
}: {
  /** 비우면 사이트 이름만 쓴다 */
  title?: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'ko_KR',
      title: fullTitle,
      description,
      url: path,
      images: [SOCIAL_IMAGE],
    },
  };
}
