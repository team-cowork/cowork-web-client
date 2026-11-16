import { type ReactNode } from 'react';

import Link from 'next/link';

import { GITHUB_ORGANIZATION_URL } from '@/widgets/promotion/model/promotion-content';
import {
  HOME_PATH,
  LICENSE_PATH,
  PRIVACY_PATH,
  TERMS_PATH,
} from '@/shared/model/paths';
import { CoworkLogo } from '@/shared/ui/icons/cowork-logo';

const footerLink =
  'typography-subtext-medium text-on-surface-variant transition-colors hover:text-on-surface';

/** 프로모션 홈과 소개용 문서 페이지가 함께 쓰는 헤더·푸터 */
export function PromotionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href={HOME_PATH}
            aria-label="cowork 홈"
            className="flex items-center gap-2.5 text-primary"
          >
            <CoworkLogo className="h-6 w-auto" />
            <span className="typography-label-medium text-on-surface">
              cowork
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-outline-variant px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col flex-wrap items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <CoworkLogo className="h-5 w-auto text-primary" />
            <span className="typography-label-small">cowork</span>
          </div>
          <Link href={LICENSE_PATH} className={footerLink}>
            © 2026 team-cowork · MIT License
          </Link>
          <nav
            aria-label="정책 및 외부 링크"
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link href={PRIVACY_PATH} className={footerLink}>
              개인정보처리방침
            </Link>
            <Link href={TERMS_PATH} className={footerLink}>
              서비스 이용약관
            </Link>
            <a
              href={GITHUB_ORGANIZATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={footerLink}
            >
              github.com/team-cowork
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
