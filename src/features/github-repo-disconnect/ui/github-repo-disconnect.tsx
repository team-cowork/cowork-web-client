'use client';

import { useState } from 'react';

import { useDisconnectGithubRepo } from '@/features/github-repo-disconnect/model/use-disconnect-github-repo';
import { type ProjectGithubRepo } from '@/entities/github/model/github';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

export function GithubRepoDisconnect({
  projectId,
  repo,
}: {
  projectId: number;
  repo: ProjectGithubRepo;
}) {
  const [open, setOpen] = useState(false);
  const disconnect = useDisconnectGithubRepo(projectId, repo.id, () =>
    setOpen(false),
  );

  return (
    <>
      <Button
        size="S"
        variant="weak"
        color="danger"
        onClick={() => setOpen(true)}
      >
        연결 해제
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          if (!disconnect.isPending) setOpen(false);
        }}
        title="저장소 연결을 해제할까요?"
        description={`이 프로젝트에서 ${repo.githubRepoUrl} 저장소의 연결과 알림 설정을 해제해요. GitHub 저장소는 삭제되지 않아요.`}
      >
        <Button
          variant="weak"
          color="neutral"
          disabled={disconnect.isPending}
          onClick={() => setOpen(false)}
        >
          취소
        </Button>
        <Button
          color="danger"
          disabled={disconnect.isPending}
          onClick={() => disconnect.mutate()}
        >
          {disconnect.isPending ? '해제하는 중…' : '연결 해제'}
        </Button>
      </Dialog>
    </>
  );
}
