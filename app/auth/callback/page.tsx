'use client';

import { Suspense, useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { LoadingPane } from '@/shared/ui/loading-pane';
import { handleAuthCallback } from '@/features/auth/api/callback';

// code/state는 1회용이라 재실행되면 서버가 거부한다. StrictMode의 mount→unmount→remount에서
// consumePkceSession()은 첫 마운트에서 이미 세션을 지우므로, 재마운트된 두 번째 실행이
// state_mismatch로 오인되지 않도록 모듈 레벨에서 요청 단위로 기억한다.
const processedRequests = new Set<string>();

function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get('code') ?? undefined;
  const state = searchParams.get('state') ?? undefined;
  const error = searchParams.get('error') ?? undefined;

  useEffect(() => {
    const requestKey = `${code ?? ''}_${state ?? ''}_${error ?? ''}`;
    if (processedRequests.has(requestKey)) return;
    processedRequests.add(requestKey);

    handleAuthCallback({ code, state, error }).then((result) => {
      router.replace(result.ok ? '/' : '/auth/error');
    });
  }, [code, state, error, router]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <LoadingPane label="DataGSM 인증 처리 중…" className="border-none bg-transparent" />
      <p className="typography-subtext-medium text-on-surface-variant text-center">
        계정 정보를 확인하고 있어요
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center px-4">
          <LoadingPane label="DataGSM 인증 처리 중…" className="border-none bg-transparent" />
        </div>
      }
    >
      <AuthCallback />
    </Suspense>
  );
}
