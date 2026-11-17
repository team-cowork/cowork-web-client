import { publicPageMetadata } from '@/shared/lib/page-metadata';
import { LICENSE_PATH } from '@/shared/model/paths';
import { LegalDocument } from '@/widgets/promotion/ui/legal/legal-document';

export const metadata = publicPageMetadata({
  title: '라이선스',
  description: 'cowork 소스 코드의 MIT 라이선스 원문입니다.',
  path: LICENSE_PATH,
});

export default function LicensePage() {
  return <LegalDocument type="license" title="라이선스" lang="en" />;
}
