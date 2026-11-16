import type { Metadata } from 'next';

import { LegalDocument } from '@/widgets/promotion/ui/legal/legal-document';
import { TermsContent } from '@/widgets/promotion/ui/legal/terms-content';

export const metadata: Metadata = {
  title: '서비스 이용약관 | cowork',
  description:
    'cowork 서비스 이용 조건과 운영자·이용자의 권리와 의무를 안내합니다.',
};

export default function TermsPage() {
  return (
    <LegalDocument>
      <TermsContent />
    </LegalDocument>
  );
}
