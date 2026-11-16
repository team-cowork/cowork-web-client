import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { HOME_PATH, SIGNIN_PATH } from '@/shared/model/paths';
import { REFRESH_TOKEN_COOKIE } from '@/shared/model/token';
import { PromotionPage } from '@/widgets/promotion/ui/promotion-page';

export const metadata: Metadata = {
  title: 'cowork',
  description:
    '광주소프트웨어마이스터고등학교 학생들이 만드는 협업 관리 플랫폼',
};

// 로그인한 사용자도 소개 화면을 볼 수 있게 두고, "웹에서 열기"만 바로 앱으로 보낸다.
export default async function WelcomePage() {
  const isSignedIn = Boolean(
    (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value,
  );

  return <PromotionPage openWebHref={isSignedIn ? HOME_PATH : SIGNIN_PATH} />;
}
