'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { LoadingPane } from '@/shared/ui/loading-pane';
import { isAuthenticated } from '@/features/auth/lib/guard';

/**
 * 보호된 라우트 진입 가드. TanStack Router의 beforeLoad를 App Router에서 대체한다.
 * access_token은 sessionStorage에만 있어 서버 미들웨어가 볼 수 없으므로 클라이언트에서 판정한다.
 * 인증되지 않았으면 /signin으로 replace 리다이렉트한다.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'authenticated'>('checking');

  useEffect(() => {
    let active = true;

    isAuthenticated().then((authenticated) => {
      if (!active) return;
      if (authenticated) {
        setStatus('authenticated');
      } else {
        router.replace('/signin');
      }
    });

    return () => {
      active = false;
    };
  }, [router]);

  if (status === 'checking') {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <LoadingPane label="로그인 상태 확인 중…" className="border-none bg-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
