import type { Metadata } from 'next';

import { SIGNIN_PATH } from '@/shared/model/paths';
import { PromotionPage } from '@/widgets/promotion/ui/promotion-page';

export const metadata: Metadata = {
  title: 'cowork',
  description:
    '광주소프트웨어마이스터고등학교 학생들이 만드는 협업 관리 플랫폼',
};

// proxy가 로그인하지 않은 사용자의 홈(/) 요청만 이 페이지로 rewrite한다.
export default function Promotion() {
  return <PromotionPage openWebHref={SIGNIN_PATH} />;
}
