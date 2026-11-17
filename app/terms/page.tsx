import { publicPageMetadata } from '@/shared/lib/page-metadata';
import { TERMS_PATH } from '@/shared/model/paths';
import { LegalDocument } from '@/widgets/promotion/ui/legal/legal-document';

export const metadata = publicPageMetadata({
  title: '서비스 이용약관',
  description:
    'cowork 서비스 이용 조건과 운영자·이용자의 권리와 의무를 안내합니다.',
  path: TERMS_PATH,
});

export default function TermsPage() {
  return <LegalDocument type="terms-of-service" title="서비스 이용약관" />;
}
