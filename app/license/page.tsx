import type { Metadata } from 'next';

import { LegalDocument } from '@/widgets/promotion/ui/legal/legal-document';
import { LicenseContent } from '@/widgets/promotion/ui/legal/license-content';

export const metadata: Metadata = {
  title: '라이선스 | cowork',
  description: 'cowork 소스 코드의 MIT 라이선스 원문입니다.',
};

export default function LicensePage() {
  return (
    <LegalDocument>
      <LicenseContent />
    </LegalDocument>
  );
}
