'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { teamQueries } from '@/entities/team/api/team-queries';
import { teamPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { UsersIcon } from '@/shared/ui/icons/users-icon';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

function HomeError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="팀을 불러오지 못했습니다"
      description="잠시 후 다시 시도해 주세요"
      action={
        <Button size="S" variant="weak" onClick={resetErrorBoundary}>
          다시 시도
        </Button>
      }
    />
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background p-6">
      <QueryBoundary
        loadingFallback={<LoadingPane label="팀을 불러오는 중…" />}
        errorFallback={HomeError}
      >
        <HomeTeams />
      </QueryBoundary>
    </div>
  );
}

function HomeTeams() {
  const router = useRouter();
  const { data: teams } = useSuspenseQuery(teamQueries.list());
  const firstTeamId = teams[0]?.id;

  useEffect(() => {
    if (firstTeamId != null) router.replace(teamPath(firstTeamId));
  }, [firstTeamId, router]);

  if (teams.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="참여 중인 팀이 없습니다"
        description="초대 링크로 팀에 가입하거나 새 팀을 만들어 보세요"
        className="max-w-md"
      />
    );
  }

  return null;
}
