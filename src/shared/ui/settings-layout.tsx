import { type ReactNode } from 'react';

export interface SettingsLayoutProps {
  /** 좌측 네비게이션 상단 영역 (제목, 카테고리 목록 등) */
  nav: ReactNode;
  /** 좌측 네비게이션 하단 고정 영역 (로그아웃 등) */
  footer?: ReactNode;
  children: ReactNode;
}

export function SettingsLayout({ nav, footer, children }: SettingsLayoutProps) {
  return (
    <div className="-mx-6 -my-5 flex flex-1">
      <aside className="flex w-56 shrink-0 flex-col justify-between bg-surface-container-low px-3 py-5">
        <div className="flex flex-col gap-0.5">{nav}</div>
        {footer && <div className="flex flex-col gap-0.5">{footer}</div>}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-6 py-5">
        {children}
      </div>
    </div>
  );
}
