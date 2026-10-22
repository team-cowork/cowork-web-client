'use client';

import { notFound, useParams } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { type FallbackProps } from 'react-error-boundary';

import { projectQueries } from '@/entities/project/api/project-queries';
import { ProjectDetail } from '@/widgets/project-detail/ui/project-detail';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

function ProjectPageError({ error, resetErrorBoundary }: FallbackProps) {
  if (isAxiosError(error) && error.response?.status === 404) notFound();

  const isForbidden = isAxiosError(error) && error.response?.status === 403;

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title={
          isForbidden
            ? '이 프로젝트를 볼 권한이 없습니다'
            : '프로젝트를 불러오지 못했습니다'
        }
        description={
          isForbidden
            ? '프로젝트 멤버만 볼 수 있어요'
            : '잠시 후 다시 시도해 주세요'
        }
        action={
          !isForbidden && (
            <Button size="S" variant="weak" onClick={resetErrorBoundary}>
              다시 시도
            </Button>
          )
        }
      />
    </div>
  );
}

function toId(value: string | undefined): number | null {
  return value && /^\d+$/.test(value) ? Number(value) : null;
}

export default function ProjectPage() {
  const { teamId } = useRouteIds();
  const projectId = toId(useParams<{ projectId?: string }>().projectId);

  if (teamId === null || projectId === null) notFound();

  return (
    <QueryBoundary
      loadingFallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <LoadingPane label="프로젝트를 불러오는 중…" />
        </div>
      }
      errorFallback={ProjectPageError}
      resetKeys={[projectId]}
    >
      <ProjectView key={projectId} teamId={teamId} projectId={projectId} />
    </QueryBoundary>
  );
}

function ProjectView({
  teamId,
  projectId,
}: {
  teamId: number;
  projectId: number;
}) {
  const { data: project } = useSuspenseQuery(projectQueries.detail(projectId));

  if (project.teamId !== teamId) notFound();

  return <ProjectDetail teamId={teamId} projectId={projectId} />;
}
