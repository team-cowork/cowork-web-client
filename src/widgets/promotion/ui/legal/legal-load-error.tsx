'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/shared/ui/button';

/** Gateway에서 문서를 받지 못했을 때. 다시 시도하면 서버에서 새로 받아 온다. */
export function LegalLoadError({ title }: { title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <h1>{title}</h1>
      <p role="status">
        {isPending
          ? '문서를 불러오고 있습니다.'
          : '문서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'}
      </p>
      <Button
        variant="weak"
        color="neutral"
        disabled={isPending}
        onClick={() => startTransition(() => router.refresh())}
        className="mt-4"
      >
        다시 시도
      </Button>
    </div>
  );
}
