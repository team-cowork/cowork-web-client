'use client';

// TODO(임시): 발표용으로 PR 보드를 사이드바에서 바로 열도록 꺼내 둔 페이지.
// 프로젝트 상세의 PR 보드를 그대로 재사용한다. 이 폴더와 사이드바의 「PR 보드」 행,
// shared/model/paths.ts의 pullsPath를 지우면 원래대로 프로젝트 상세에서만 본다.
import { useState } from 'react';

import { notFound } from 'next/navigation';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { projectQueries } from '@/entities/project/api/project-queries';
import { userQueries } from '@/entities/user/api/user-queries';
import { GithubPrBoard } from '@/widgets/project-detail/ui/github-pr-board';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SegmentedControl } from '@/shared/ui/segmented-control';

function PullsError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="프로젝트를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
    />
  );
}

export default function TeamPullsPage() {
  const { teamId } = useRouteIds();

  if (teamId === null) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <header className="flex h-12 shrink-0 items-center px-6">
        <h1 className="typography-label-medium text-on-surface">PR 보드</h1>
      </header>
      <div className="flex min-w-0 flex-1 flex-col gap-3 px-6 pb-6">
        <QueryBoundary
          loadingFallback={<LoadingPane label="프로젝트를 불러오는 중…" />}
          errorFallback={PullsError}
          resetKeys={[teamId]}
        >
          <TeamPulls teamId={teamId} />
        </QueryBoundary>
      </div>
    </div>
  );
}

function TeamPulls({ teamId }: { teamId: number }) {
  const { data: projects } = useSuspenseQuery(projectQueries.byTeam(teamId));
  const [selectedId, setSelectedId] = useState<string>();

  if (projects.length === 0) {
    return (
      <EmptyState
        title="프로젝트가 없어요"
        description="프로젝트를 만들고 GitHub 저장소를 연결하면 PR을 볼 수 있어요."
      />
    );
  }

  const project =
    projects.find((candidate) => String(candidate.id) === selectedId) ??
    projects[0];

  return (
    <>
      {projects.length > 1 && (
        <div className="overflow-x-auto" aria-label="프로젝트 선택">
          <SegmentedControl
            value={String(project.id)}
            onChange={setSelectedId}
            options={projects.map((candidate) => ({
              value: String(candidate.id),
              label: candidate.name,
            }))}
          />
        </div>
      )}
      <ProjectPulls key={project.id} projectId={project.id} />
    </>
  );
}

function ProjectPulls({ projectId }: { projectId: number }) {
  const { data: members = [] } = useQuery(projectQueries.members(projectId));
  const { data: me } = useQuery(userQueries.me());
  // 프로젝트 상세와 같은 기준이다. 세부 권한은 서버가 다시 확인한다.
  const canWrite = members.some(
    (member) => member.userId === me?.id && member.write,
  );

  return <GithubPrBoard projectId={projectId} canWrite={canWrite} />;
}
