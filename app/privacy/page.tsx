import type { Metadata } from 'next';

import { LegalDocument } from '@/widgets/promotion/ui/legal/legal-document';
import { PrivacyContent } from '@/widgets/promotion/ui/legal/privacy-content';

export const metadata: Metadata = {
  title: '개인정보처리방침 | cowork',
  description:
    'cowork가 처리하는 개인정보의 항목, 목적, 보유기간과 이용자의 권리를 안내합니다.',
};

export default function PrivacyPage() {
  return (
    <LegalDocument>
      <PrivacyContent />
    </LegalDocument>
  );
}
