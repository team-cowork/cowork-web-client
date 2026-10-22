'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';

import { projectQueries } from '@/entities/project/api/project-queries';
import { PROJECT_STATUS_LABEL } from '@/entities/project/model/project';
import { CreateProjectModal } from '@/features/project-create/ui/create-project-modal';
import { cn } from '@/shared/lib/cn';
import { projectPath } from '@/shared/model/paths';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { FolderIcon } from '@/shared/ui/icons/folder-icon';
import { LoadingPane } from '@/shared/ui/loading-pane';

export interface TeamProjectGridProps {
  teamId: number;
  className?: string;
}

/** 팀 홈에서 팀 프로젝트를 카드로 모아 보여준다. 내가 참여한 프로젝트를 표시한다. */
export function TeamProjectGrid({ teamId, className }: TeamProjectGridProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const projects = useQuery(projectQueries.byTeam(teamId));
  const { data: myProjects } = useQuery(projectQueries.mine());
  const mine = new Set(myProjects?.map((project) => project.id));

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-4xl flex-col gap-5 px-8 py-10',
        className,
      )}
    >
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="typography-title-small text-on-surface">프로젝트</h1>
          <p className="typography-subtext-medium text-on-surface-variant">
            왼쪽 목록에서 채널을 골라 대화를 시작할 수 있어요.
          </p>
        </div>
        <Button size="S" onClick={() => setCreateOpen(true)}>
          프로젝트 만들기
        </Button>
      </div>

      {projects.isPending ? (
        <LoadingPane label="프로젝트를 불러오는 중…" />
      ) : projects.isError ? (
        <ErrorState
          title="프로젝트를 불러오지 못했습니다"
          action={
            <Button
              size="S"
              variant="weak"
              onClick={() => void projects.refetch()}
            >
              다시 시도
            </Button>
          }
        />
      ) : projects.data.length === 0 ? (
        <EmptyState
          icon={<FolderIcon />}
          title="아직 프로젝트가 없습니다"
          description="프로젝트를 만들어 채널과 멤버를 묶어 관리해 보세요"
        />
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          {projects.data.map((project) => (
            <li key={project.id}>
              <Link
                href={projectPath(teamId, project.id)}
                className="flex h-full flex-col gap-2 rounded-[16px] border border-outline-variant bg-surface p-4 hover:border-outline"
              >
                <div className="flex items-center gap-2">
                  <FolderIcon
                    size={18}
                    className="shrink-0 text-on-surface-variant"
                  />
                  <span className="min-w-0 flex-1 truncate typography-label-small text-on-surface">
                    {project.name}
                  </span>
                  {project.status === 'ARCHIVED' && (
                    <Badge>{PROJECT_STATUS_LABEL[project.status]}</Badge>
                  )}
                  {mine.has(project.id) && <Badge color="brand">참여 중</Badge>}
                </div>
                <p className="line-clamp-2 typography-subtext-medium text-on-surface-variant">
                  {project.description ?? '설명이 없습니다'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CreateProjectModal
        open={createOpen}
        teamId={teamId}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
