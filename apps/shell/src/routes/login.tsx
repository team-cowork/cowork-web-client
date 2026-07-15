import { Button } from '@cowork/ui';

import { createFileRoute } from '@tanstack/react-router';

import { startLogin } from '../features/auth/api/login';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="bg-surface flex w-full max-w-[460px] flex-col items-center gap-5 rounded-3xl px-12 pt-12 pb-10">
        <div className="bg-primary flex size-16 items-center justify-center rounded-[20px]">
          <span className="typography-display-small text-on-primary">co</span>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="typography-display-large text-on-surface">Cowork</h1>
          <p className="typography-subtext-large text-on-surface-variant">
            팀 협업을 위한 올인원 워크스페이스
          </p>
        </div>

        <div className="h-2 w-full" />

        <Button size="L" color="brand" className="w-full" onClick={() => void startLogin()}>
          DataGSM 계정으로 로그인
        </Button>

        <p className="typography-subtext-small text-on-surface-variant text-center">
          GSM 계정으로 안전하게 로그인합니다
        </p>
      </div>
    </div>
  );
}
