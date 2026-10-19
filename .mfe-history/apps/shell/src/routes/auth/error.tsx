import { Button, ErrorState } from '@cowork/ui';

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/error')({
  component: AuthErrorPage,
});

function AuthErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-[460px] flex-col items-center gap-5">
        <div className="bg-error-container flex size-16 items-center justify-center rounded-full">
          <img src="/assets/auth/login-failed.svg" alt="로그인 실패" className="size-[30px]" />
        </div>

        <ErrorState
          title="로그인에 실패했어요"
          description="DataGSM 인증이 취소되었거나 만료되었습니다. 다시 시도해 주세요."
          className="w-full"
          action={
            <div className="flex w-full flex-col items-center gap-3">
              <Button
                size="L"
                color="brand"
                className="w-full"
                onClick={() => navigate({ to: '/signin' })}
              >
                다시 로그인
              </Button>
              <Link to="/signin" className="typography-label-x-small text-on-surface-variant">
                처음으로 돌아가기
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}
