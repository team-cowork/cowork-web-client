import { useEffect, useRef } from 'react';

import { LoadingPane } from '@cowork/ui';

import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { handleAuthCallback } from '../features/auth/callback';

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

function AuthCallbackPage() {
  const { code, state, error } = Route.useSearch();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    // code는 1회용이라 재실행되면 서버가 거부한다 — 같은 렌더 사이클에서 중복 호출을 막는다.
    if (ranRef.current) return;
    ranRef.current = true;

    handleAuthCallback({ code, state, error }).then((result) => {
      navigate({ to: result.ok ? '/' : '/auth/error', replace: true });
    });
  }, [code, state, error, navigate]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <LoadingPane label="DataGSM 인증 처리 중…" className="border-none bg-transparent" />
      <p className="typography-subtext-medium text-on-surface-variant text-center">
        계정 정보를 확인하고 있어요 · 권한 self:read
      </p>
    </div>
  );
}
