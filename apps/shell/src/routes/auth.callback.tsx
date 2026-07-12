import { LoadingPane } from '@cowork/ui';

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <LoadingPane label="DataGSM 인증 처리 중…" className="border-none bg-transparent" />
      <p className="typography-subtext-medium text-on-surface-variant text-center">
        계정 정보를 확인하고 있어요 · 권한 self:read
      </p>
    </div>
  );
}
