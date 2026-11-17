import { connection } from 'next/server';

import { getLegalDocument } from '@/widgets/promotion/api/get-legal-document';
import { type LegalDocumentType } from '@/widgets/promotion/model/legal-document';
import { LegalDocumentView } from '@/widgets/promotion/ui/legal/legal-document-view';
import { LegalLoadError } from '@/widgets/promotion/ui/legal/legal-load-error';
import { PromotionLayout } from '@/widgets/promotion/ui/promotion-layout';

import './legal.css';

export async function LegalDocument({
  type,
  title,
  lang = 'ko',
}: {
  type: LegalDocumentType;
  /** 문서를 받지 못했을 때 보여 줄 제목 */
  title: string;
  lang?: string;
}) {
  // 빌드 때 Gateway에 닿지 못해 실패 화면이 굳지 않도록 요청 시점에 그린다.
  // 성공한 응답은 getLegalDocument가 몇 분간 캐시한다.
  await connection();
  const document = await getLegalDocument(type);

  return (
    <PromotionLayout>
      <article className="legal">
        {document ? (
          <LegalDocumentView document={document} lang={lang} />
        ) : (
          <LegalLoadError title={title} />
        )}
      </article>
    </PromotionLayout>
  );
}
