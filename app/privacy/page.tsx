import { publicPageMetadata } from '@/shared/lib/page-metadata';
import { PRIVACY_PATH } from '@/shared/model/paths';
import { LegalDocument } from '@/widgets/promotion/ui/legal/legal-document';

export const metadata = publicPageMetadata({
  title: '개인정보처리방침',
  description:
    'cowork가 처리하는 개인정보의 항목, 목적, 보유기간과 이용자의 권리를 안내합니다.',
  path: PRIVACY_PATH,
});

export default function PrivacyPage() {
  return <LegalDocument type="privacy-policy" title="개인정보처리방침" />;
}
