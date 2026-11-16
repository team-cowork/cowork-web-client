import { type ReactNode } from 'react';

import { PromotionLayout } from '@/widgets/promotion/ui/promotion-layout';

import './legal.css';

export function LegalDocument({ children }: { children: ReactNode }) {
  return (
    <PromotionLayout>
      <article className="legal">{children}</article>
    </PromotionLayout>
  );
}
