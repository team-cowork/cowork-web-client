'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/shared/ui/button';

export default function AuthErrorPage() {
  const router = useRouter();

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="bg-surface flex w-full max-w-[460px] flex-col items-center gap-6 rounded-3xl px-12 pt-12 pb-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="typography-title-large text-on-surface">로그인에 실패했어요</h1>
          <p className="typography-subtext-medium text-on-surface-variant">
            인증 도중 문제가 발생했어요. 다시 시도해 주세요.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <Button size="L" color="brand" className="w-full" onClick={() => router.push('/signin')}>
            다시 로그인
          </Button>
          <Link
            href="/signin"
            className="typography-label-x-small text-on-surface-variant"
          >
            처음으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
