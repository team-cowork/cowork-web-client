'use client';

import { Button } from '@/shared/ui/button';
import { startSignin } from '@/features/auth/api/signin';

export default function SigninPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="bg-surface flex w-full max-w-[460px] flex-col items-center gap-5 rounded-3xl px-12 pt-12 pb-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="typography-title-large text-on-surface">cowork</h1>
          <p className="typography-subtext-medium text-on-surface-variant">
            DataGSM 계정으로 로그인하세요
          </p>
        </div>

        <div className="h-2 w-full" />

        <Button size="L" color="brand" className="w-full" onClick={() => void startSignin()}>
          DataGSM 계정으로 로그인
        </Button>
      </div>
    </div>
  );
}
