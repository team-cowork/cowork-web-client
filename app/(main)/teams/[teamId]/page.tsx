'use client';

import { notFound } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type FallbackProps } from 'react-error-boundary';

import { teamQueries } from '@/entities/team/api/team-queries';
import { TeamProjectGrid } from '@/widgets/team-projects/ui/team-project-grid';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

function TeamPageError({ error, resetErrorBoundary }: FallbackProps) {
  if (isAxiosError(error) && error.response?.status === 404) notFound();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="팀을 불러오지 못했습니다"
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

export default function TeamPage() {
  const { teamId } = useRouteIds();

  if (teamId === null) notFound();

  return (
    <QueryBoundary
      loadingFallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <LoadingPane label="팀을 불러오는 중…" />
        </div>
      }
      errorFallback={TeamPageError}
      resetKeys={[teamId]}
    >
      <TeamView teamId={teamId} />
    </QueryBoundary>
  );
}

function TeamView({ teamId }: { teamId: number }) {
  useSuspenseQuery(teamQueries.detail(teamId));

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto bg-background">
      <TeamProjectGrid teamId={teamId} />
    </div>
  );
}
