'use client';

// TODO(임시): 발표용 임시 칸반. 연결된 GitHub 저장소의 열린 이슈를 보여 주고,
// 열은 '진행중' 라벨 유무로 나눈다(entities/issue). 카드를 누르면 GitHub 이슈로 간다.
// 서버가 이슈 상태·닫기 API를 주면 이 위젯을 그에 맞게 고치고, 안 쓰기로 하면 이 폴더와
// entities/issue, features/github-issue-move, app/(main)/teams/[teamId]/issues를 지운다.
import { useState } from 'react';

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { useQueries, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { githubQueries } from '@/entities/github/api/github-queries';
import { type GithubIssueSummary } from '@/entities/github/model/github';
import {
  ISSUE_STATUS_LABEL,
  ISSUE_STATUSES,
  issueStatusOf,
  type IssueStatus,
} from '@/entities/issue/model/issue';
import { linkedIssueNumbers } from '@/entities/issue/model/linked-issues';
import { projectQueries } from '@/entities/project/api/project-queries';
import { useMoveIssue } from '@/features/github-issue-move/model/use-move-issue';
import { cn } from '@/shared/lib/cn';
import { useVanishedItems } from '@/shared/lib/use-vanished-items';
import { formatDate } from '@/shared/lib/format-date';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { KanbanCard } from '@/shared/ui/kanban-card';
import { KanbanColumn } from '@/shared/ui/kanban-column';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SegmentedControl } from '@/shared/ui/segmented-control';

function BoardError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      title="이슈를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
    />
  );
}

const githubRepoName = (url: string) =>
  url
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/\/$/, '')
    .replace(/\.git$/, '');

/** GitHub 주소만 링크로 쓴다. */
const isGithubUrl = (url: string) => /^https:\/\/github\.com\//.test(url);

export function IssueBoard({ teamId }: { teamId: number }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <header className="flex h-12 shrink-0 items-center px-6">
        <h1 className="typography-label-medium text-on-surface">이슈</h1>
      </header>
      <div className="flex min-w-0 flex-1 flex-col gap-3 px-6 pb-6">
        <QueryBoundary
          loadingFallback={<LoadingPane label="프로젝트를 불러오는 중…" />}
          errorFallback={BoardError}
          resetKeys={[teamId]}
        >
          <ProjectIssues teamId={teamId} />
        </QueryBoundary>
      </div>
    </div>
  );
}

function ProjectIssues({ teamId }: { teamId: number }) {
  const { data: projects } = useSuspenseQuery(projectQueries.byTeam(teamId));
  const [selectedId, setSelectedId] = useState<string>();

  if (projects.length === 0) {
    return (
      <EmptyState
        title="프로젝트가 없어요"
        description="프로젝트를 만들고 GitHub 저장소를 연결하면 이슈를 볼 수 있어요."
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
      <QueryBoundary
        loadingFallback={<LoadingPane label="저장소를 불러오는 중…" />}
        errorFallback={BoardError}
        resetKeys={[project.id]}
      >
        <RepoIssues key={project.id} projectId={project.id} />
      </QueryBoundary>
    </>
  );
}

function RepoIssues({ projectId }: { projectId: number }) {
  const { data: repos } = useSuspenseQuery(
    githubQueries.projectRepos(projectId),
  );
  const [selectedId, setSelectedId] = useState<string>();

  if (repos.length === 0) {
    return (
      <EmptyState
        title="연결된 GitHub 저장소가 없어요"
        description="프로젝트 상세에서 저장소를 연결하면 이슈를 볼 수 있어요."
      />
    );
  }

  const repo =
    repos.find((candidate) => String(candidate.id) === selectedId) ?? repos[0];
  const newIssueUrl = `${repo.githubRepoUrl.replace(/\/$/, '').replace(/\.git$/, '')}/issues/new`;

  return (
    <>
      <div className="flex items-center gap-3">
        {repos.length > 1 && (
          <div className="min-w-0 overflow-x-auto" aria-label="저장소 선택">
            <SegmentedControl
              value={String(repo.id)}
              onChange={setSelectedId}
              options={repos.map((candidate) => ({
                value: String(candidate.id),
                label: githubRepoName(candidate.githubRepoUrl),
              }))}
            />
          </div>
        )}
        {isGithubUrl(newIssueUrl) && (
          <a
            href={newIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex h-9 shrink-0 items-center rounded-[10px] bg-primary px-3.5 typography-label-small text-on-primary hover:opacity-90"
          >
            + 새 이슈
          </a>
        )}
      </div>
      <QueryBoundary
        loadingFallback={<LoadingPane label="이슈를 불러오는 중…" />}
        errorFallback={BoardError}
        resetKeys={[projectId, repo.id]}
      >
        <Board key={repo.id} projectId={projectId} repoId={repo.id} />
      </QueryBoundary>
    </>
  );
}

function Board({ projectId, repoId }: { projectId: number; repoId: number }) {
  const { data: issues } = useSuspenseQuery(
    githubQueries.issues(projectId, repoId),
  );
  const closed = useVanishedItems(`cowork.issue-board.seen.${repoId}`, issues);
  const linked = useLinkedIssueNumbers(projectId, repoId);
  const moveIssue = useMoveIssue(projectId, repoId);
  // 옮긴 카드의 열. 라벨 변경은 서버가 비동기로 처리해서, 다시 불러와도 바로 반영되지 않는다.
  const [moved, setMoved] = useState<Record<number, IssueStatus>>({});
  // TODO(임시): 열린 이슈는 `진행중` 라벨이 있거나 열린 PR 이 가리키면 진행중이다.
  const statusOf = (issue: GithubIssueSummary): IssueStatus =>
    moved[issue.number] ??
    (issueStatusOf(issue.labels) === 'IN_PROGRESS' || linked.has(issue.number)
      ? 'IN_PROGRESS'
      : 'PLANNED');
  const columns: Record<IssueStatus, GithubIssueSummary[]> = {
    PLANNED: issues.filter((issue) => statusOf(issue) === 'PLANNED'),
    IN_PROGRESS: issues.filter((issue) => statusOf(issue) === 'IN_PROGRESS'),
    DONE: closed,
  };

  const handleDragEnd = ({ source, destination }: DropResult) => {
    if (!destination || destination.droppableId === source.droppableId) return;

    const status = destination.droppableId as IssueStatus;
    const issue = columns[source.droppableId as IssueStatus][source.index];
    if (!issue) return;

    setMoved((current) => ({ ...current, [issue.number]: status }));
    moveIssue.mutate(
      { issue, status },
      {
        onError: () =>
          setMoved((current) => {
            const rest = { ...current };
            delete rest[issue.number];
            return rest;
          }),
      },
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-3">
        {ISSUE_STATUSES.map((status) => (
          <Column key={status} status={status} issues={columns[status]} />
        ))}
      </div>
    </DragDropContext>
  );
}

/**
 * 열린 PR(Draft 포함)이 가리키는 이슈 번호. PR 본문과 브랜치 이름을 읽어야 해서 PR 마다
 * 상세를 부른다. 못 읽어도 칸반은 보여야 해서 실패하면 연결을 모르는 것으로 둔다.
 */
function useLinkedIssueNumbers(projectId: number, repoId: number): Set<number> {
  const { data: board } = useQuery(githubQueries.pullBoard(projectId, repoId));
  const pulls = [...(board?.draft ?? []), ...(board?.inReview ?? [])];
  const details = useQueries({
    queries: pulls.map((pull) =>
      githubQueries.pull(projectId, repoId, pull.number),
    ),
  });

  return new Set(
    details.flatMap((detail) =>
      detail.data ? [...linkedIssueNumbers(detail.data)] : [],
    ),
  );
}

function Column({
  status,
  issues,
}: {
  status: IssueStatus;
  issues: GithubIssueSummary[];
}) {
  return (
    <KanbanColumn
      title={ISSUE_STATUS_LABEL[status]}
      count={issues.length}
      emptyText={
        status === 'DONE'
          ? '이 화면에서 본 이슈가 GitHub에서 닫히면 여기로 와요.'
          : '이 상태의 이슈가 없어요.'
      }
    >
      <Droppable droppableId={status} isDropDisabled={status === 'DONE'}>
        {(droppable, snapshot) => (
          <ul
            ref={droppable.innerRef}
            {...droppable.droppableProps}
            className={cn(
              'flex min-h-8 flex-col gap-2 rounded-lg',
              snapshot.isDraggingOver && 'bg-surface-container-high',
            )}
          >
            {issues.map((issue, index) => (
              <Draggable
                key={issue.number}
                draggableId={String(issue.number)}
                index={index}
                isDragDisabled={status === 'DONE'}
              >
                {(draggable, dragSnapshot) => (
                  <li
                    ref={draggable.innerRef}
                    {...draggable.draggableProps}
                    {...draggable.dragHandleProps}
                  >
                    <IssueCard
                      issue={issue}
                      dragging={dragSnapshot.isDragging}
                    />
                  </li>
                )}
              </Draggable>
            ))}
            {droppable.placeholder}
          </ul>
        )}
      </Droppable>
    </KanbanColumn>
  );
}

function IssueCard({
  issue,
  dragging,
}: {
  issue: GithubIssueSummary;
  dragging: boolean;
}) {
  // 누르면 GitHub 이슈로 간다. 이슈 닫기는 서버 API가 없어 GitHub에서 한다.
  return (
    <KanbanCard
      href={isGithubUrl(issue.htmlUrl) ? issue.htmlUrl : undefined}
      dragging={dragging}
    >
      {issue.labels.length > 0 && (
        <span className="flex flex-wrap gap-1">
          {issue.labels.map((label) => (
            <Badge key={label} className="max-w-full break-all">
              {label}
            </Badge>
          ))}
        </span>
      )}
      <span className="typography-label-small break-words text-on-surface">
        {issue.title}
      </span>
      <span className="typography-subtext-medium break-all text-on-surface-variant">
        #{issue.number} · {issue.author} · {formatDate(issue.updatedAt)}
      </span>
    </KanbanCard>
  );
}
