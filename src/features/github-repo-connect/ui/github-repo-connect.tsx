'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { githubQueries } from '@/entities/github/api/github-queries';
import { useConnectGithubRepo } from '@/features/github-repo-connect/model/use-connect-github-repo';
import { teamSettingsGithubPath } from '@/shared/model/paths';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Modal } from '@/shared/ui/modal';
import { TextField } from '@/shared/ui/text-field';

export function GithubRepoConnect({
  teamId,
  projectId,
}: {
  teamId: number;
  projectId: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="S" onClick={() => setOpen(true)}>
        저장소 연결
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="GitHub 저장소 연결"
      >
        {open && (
          <ConnectRepos
            teamId={teamId}
            projectId={projectId}
            onClose={() => setOpen(false)}
          />
        )}
      </Modal>
    </>
  );
}

function ConnectRepos({
  teamId,
  projectId,
  onClose,
}: {
  teamId: number;
  projectId: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState('');
  // 400(팀 GitHub 미연동)은 재시도해도 같으므로 바로 안내 화면을 보여준다.
  const repos = useQuery({
    ...githubQueries.orgRepos(projectId),
    retry: false,
  });
  const connect = useConnectGithubRepo(projectId, onClose);

  if (isAxiosError(repos.error) && repos.error.response?.status === 400) {
    return (
      <EmptyState
        title="팀에 GitHub 조직을 연결해 주세요"
        description="저장소를 연결하려면 먼저 팀의 GitHub 연동이 필요해요."
        action={
          <Button onClick={() => router.push(teamSettingsGithubPath(teamId))}>
            팀 GitHub 설정으로 이동
          </Button>
        }
      />
    );
  }
  if (repos.isPending)
    return (
      <p className="typography-subtext-medium text-on-surface-variant">
        저장소를 불러오는 중이에요…
      </p>
    );
  if (repos.isError)
    return (
      <EmptyState
        title="저장소를 불러오지 못했어요"
        action={<Button onClick={() => void repos.refetch()}>다시 시도</Button>}
      />
    );

  const filtered = repos.data.filter((repo) =>
    repo.fullName.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <>
      <TextField
        label="저장소 검색"
        placeholder="소유자 또는 저장소 이름으로 검색해 주세요"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        autoFocus
      />
      {filtered.length === 0 ? (
        <EmptyState
          title={
            repos.data.length === 0
              ? '연결할 수 있는 저장소가 없어요'
              : '검색 결과가 없어요'
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((repo) => (
            <li key={repo.fullName}>
              <Button
                className="w-full justify-start"
                variant="weak"
                color="neutral"
                disabled={connect.isPending}
                onClick={() => connect.mutate(repo.htmlUrl)}
              >
                {repo.fullName}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {connect.isPending && (
        <p
          role="status"
          className="typography-subtext-medium text-on-surface-variant"
        >
          저장소를 연결하는 중이에요…
        </p>
      )}
    </>
  );
}
