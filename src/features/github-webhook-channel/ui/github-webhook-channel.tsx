'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useClearGithubWebhookChannel } from '@/features/github-webhook-channel/model/use-clear-github-webhook-channel';
import { useSetGithubWebhookChannel } from '@/features/github-webhook-channel/model/use-set-github-webhook-channel';
import { type ProjectGithubRepo } from '@/entities/github/model/github';
import { projectQueries } from '@/entities/project/api/project-queries';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Modal } from '@/shared/ui/modal';

export function GithubWebhookChannel({
  projectId,
  repo,
}: {
  projectId: number;
  repo: ProjectGithubRepo;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="S"
        variant="weak"
        color="neutral"
        onClick={() => setOpen(true)}
      >
        알림 채널 설정
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="GitHub 알림 채널 설정"
      >
        {open && (
          <ChannelOptions
            projectId={projectId}
            repo={repo}
            onClose={() => setOpen(false)}
          />
        )}
      </Modal>
    </>
  );
}

function ChannelOptions({
  projectId,
  repo,
  onClose,
}: {
  projectId: number;
  repo: ProjectGithubRepo;
  onClose: () => void;
}) {
  const channels = useQuery(projectQueries.channels(projectId));
  const setChannel = useSetGithubWebhookChannel(projectId, repo.id, onClose);
  const clearChannel = useClearGithubWebhookChannel(
    projectId,
    repo.id,
    onClose,
  );
  const isPending = setChannel.isPending || clearChannel.isPending;
  const sortedChannels = [...(channels.data ?? [])].sort(
    (a, b) =>
      Number(b.viewType === 'WEBHOOK') - Number(a.viewType === 'WEBHOOK') ||
      a.position - b.position,
  );

  return (
    <>
      <p className="typography-subtext-medium text-on-surface-variant">
        알림을 받을 프로젝트 채널을 선택해 주세요. 웹훅 채널을 먼저 보여드려요.
      </p>
      {channels.isPending ? (
        <p className="typography-subtext-medium text-on-surface-variant">
          채널을 불러오는 중이에요…
        </p>
      ) : channels.isError ? (
        <EmptyState
          title="채널을 불러오지 못했어요"
          action={
            <Button onClick={() => void channels.refetch()}>다시 시도</Button>
          }
        />
      ) : sortedChannels.length === 0 ? (
        <EmptyState
          title="프로젝트에 속한 채널이 없어요"
          description="먼저 프로젝트에 채널을 추가해 주세요."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {sortedChannels.map((channel) => (
            <li key={channel.id}>
              <Button
                className="w-full justify-start"
                variant="weak"
                color="neutral"
                aria-pressed={channel.id === repo.githubWebhookChannelId}
                disabled={isPending}
                onClick={() => setChannel.mutate(channel.id)}
              >
                #{channel.name}
                {channel.viewType === 'WEBHOOK' ? ' · 웹훅' : ''}
                {channel.id === repo.githubWebhookChannelId
                  ? ' · 현재 알림 채널'
                  : ''}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {repo.githubWebhookChannelId != null && (
        <Button
          variant="weak"
          color="danger"
          disabled={isPending}
          onClick={() => clearChannel.mutate()}
        >
          알림 해제
        </Button>
      )}
      {isPending && (
        <p
          role="status"
          className="typography-subtext-medium text-on-surface-variant"
        >
          알림 설정을 변경하는 중이에요…
        </p>
      )}
    </>
  );
}
