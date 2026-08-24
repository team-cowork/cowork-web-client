'use client';

import { notFound } from 'next/navigation';

import { useQueries, useSuspenseQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type FallbackProps } from 'react-error-boundary';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { userQueries } from '@/entities/user/api/user-queries';
import { DmHeader } from '@/widgets/dm-header/ui/dm-header';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { ChatIcon } from '@/shared/ui/icons/chat-icon';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

function DmPageError({ error, resetErrorBoundary }: FallbackProps) {
  if (isAxiosError(error) && error.response?.status === 404) notFound();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="대화를 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요"
        action={
          <Button size="S" variant="weak" onClick={resetErrorBoundary}>
            다시 시도
          </Button>
        }
      />
    </div>
  );
}

export default function DmPage() {
  const { channelId } = useRouteIds();

  if (channelId === null) notFound();

  return (
    <QueryBoundary
      loadingFallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <LoadingPane label="대화를 불러오는 중…" />
        </div>
      }
      errorFallback={DmPageError}
      resetKeys={[channelId]}
    >
      <DmView channelId={channelId} />
    </QueryBoundary>
  );
}

function DmView({ channelId }: { channelId: number }) {
  const { data: channel } = useSuspenseQuery(channelQueries.detail(channelId));
  const { data: me } = useSuspenseQuery(userQueries.me());
  const { data: members } = useSuspenseQuery(channelQueries.members(channelId));

  const peerResults = useQueries({
    queries: members
      .filter((member) => member.userId !== me.id)
      .map((member) => userQueries.detail(member.userId)),
  });

  if (channel.type !== 'DM') {
    notFound();
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-background">
      <DmHeader user={peerResults[0]?.data} />

      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          icon={<ChatIcon />}
          title="채팅 기능 준비 중"
          description="메시지 API 연동 후 이 영역에 대화가 표시됩니다"
          className="max-w-md"
        />
      </div>
    </div>
  );
}
