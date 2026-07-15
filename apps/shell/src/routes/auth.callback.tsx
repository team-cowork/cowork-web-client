import { useEffect } from 'react';

import { LoadingPane } from '@cowork/ui';

import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { handleAuthCallback } from '../features/auth/api/callback';

export interface AuthCallbackSearch {
  code?: string;
  state?: string;
  error?: string;
}

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>): AuthCallbackSearch => ({
    code: typeof search.code === 'string' ? search.code : undefined,
    state: typeof search.state === 'string' ? search.state : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: AuthCallbackPage,
});

// code/state는 1회용이라 재실행되면 서버가 거부한다. StrictMode의 mount→unmount→remount에서
// useRef는 재마운트 시 초기화되지만 consumePkceSession()은 첫 마운트에서 이미 세션을 지우므로,
// 재마운트된 두 번째 실행이 state_mismatch로 오인되지 않도록 모듈 레벨에서 요청 단위로 기억한다.
const processedRequests = new Set<string>();

function AuthCallbackPage() {
  const { code, state, error } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    const requestKey = `${code ?? ''}_${state ?? ''}_${error ?? ''}`;
    if (processedRequests.has(requestKey)) return;
    processedRequests.add(requestKey);

    handleAuthCallback({ code, state, error }).then((result) => {
      navigate({ to: result.ok ? '/' : '/auth/error', replace: true });
    });
  }, [code, state, error, navigate]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <LoadingPane label="DataGSM 인증 처리 중…" className="border-none bg-transparent" />
      <p className="typography-subtext-medium text-on-surface-variant text-center">
        계정 정보를 확인하고 있어요
      </p>
    </div>
  );
}
