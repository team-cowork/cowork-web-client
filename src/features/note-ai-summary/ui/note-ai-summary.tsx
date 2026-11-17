'use client';

import { useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { githubQueries } from '@/entities/github/api/github-queries';
import { postGithubIssue } from '@/entities/github/api/post-github-issue';
import { type ProjectGithubRepo } from '@/entities/github/model/github';
import { type MeetingNoteSectionView } from '@/entities/meeting-note/model/meeting-note';
import { postNoteSummary } from '@/features/note-ai-summary/api/post-note-summary';
import {
  type ActionItem,
  type NoteSummary,
} from '@/features/note-ai-summary/model/note-summary';
import { getHttpErrorMessage, isHttpStatus } from '@/shared/api/http-error';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/toast-provider';

export interface NoteAiSummaryProps {
  channelId: number;
  title: string;
  sections: MeetingNoteSectionView[];
}

/** AI 에 보낼 회의록 글. 비어 있는 섹션은 뺀다. */
function toPromptText(sections: MeetingNoteSectionView[]): string {
  return sections
    .filter((section) => section.value.trim() !== '')
    .map((section) => `## ${section.title}\n${section.value.trim()}`)
    .join('\n\n');
}

/** 이 채널과 연결된 저장소를 먼저 고른다. 없으면 프로젝트의 첫 저장소. */
function pickRepo(
  repos: ProjectGithubRepo[] | undefined,
  channelId: number,
): ProjectGithubRepo | null {
  return (
    repos?.find((repo) => repo.githubWebhookChannelId === channelId) ??
    repos?.[0] ??
    null
  );
}

/** `https://github.com/org/repo` 에서 `org/repo` 만 보여 준다. */
function repoLabel(repo: ProjectGithubRepo): string {
  return repo.githubRepoUrl.replace(/^https?:\/\/github\.com\//, '');
}

/** 회의록 AI 요약과, 요약에서 뽑은 할 일을 GitHub 이슈로 만드는 버튼. */
export function NoteAiSummary({
  channelId,
  title,
  sections,
}: NoteAiSummaryProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState<NoteSummary | null>(null);
  const [created, setCreated] = useState<ReadonlySet<number>>(new Set());

  // 이슈 만들기에만 필요하므로 요약이 나온 뒤에 조회한다.
  const hasSummary = summary !== null;
  const { data: channel } = useQuery({
    ...channelQueries.detail(channelId),
    enabled: hasSummary,
  });
  const projectId = channel?.projectId ?? null;
  const { data: repos } = useQuery({
    ...githubQueries.projectRepos(projectId ?? 0),
    enabled: hasSummary && projectId !== null,
  });
  const repo = pickRepo(repos, channelId);

  const text = toPromptText(sections);

  const summarize = useMutation({
    mutationFn: () => postNoteSummary({ title, content: text }),
    onSuccess: (next) => {
      setSummary(next);
      // 만든 할 일은 index 로 기록하므로, 새 요약에는 이어 쓰지 않는다.
      setCreated(new Set());
    },
    onError: (error) =>
      toast(
        isHttpStatus(error, 404)
          ? '이 환경에서는 AI 요약을 쓸 수 없어요.'
          : getHttpErrorMessage(
              error,
              'AI 요약을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
            ),
      ),
  });

  const createIssue = useMutation({
    mutationFn: ({ item }: { item: ActionItem; index: number }) =>
      postGithubIssue(projectId ?? 0, repo?.id ?? 0, {
        title: item.title,
        body: [item.body, `회의록: ${title}`]
          .filter((part) => part !== '')
          .join('\n\n'),
      }),
    onSuccess: (_, { index }) => {
      setCreated((prev) => new Set(prev).add(index));
      toast('이슈를 만들고 있어요. GitHub에 보이기까지 잠시 걸려요.');
    },
    onError: (error) =>
      toast(getHttpErrorMessage(error, '이슈를 만들지 못했어요.')),
  });

  if (text === '') return null;

  if (!summary) {
    return (
      <div>
        <Button
          size="S"
          variant="weak"
          disabled={summarize.isPending}
          onClick={() => summarize.mutate()}
        >
          {summarize.isPending ? '요약하는 중…' : 'AI 요약'}
        </Button>
      </div>
    );
  }

  const canCreate = projectId !== null && repo !== null;
  // 채널·저장소 조회가 끝나기 전에는 연결 안내를 띄우지 않는다.
  const lookupDone =
    channel !== undefined && (projectId === null || repos !== undefined);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-variant/40 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="typography-title-small text-on-surface">AI 요약</h2>
        <Button
          size="S"
          variant="weak"
          color="neutral"
          // 이슈를 만드는 중에 새 요약이 오면 만든 할 일 표시가 어긋난다.
          disabled={summarize.isPending || createIssue.isPending}
          onClick={() => summarize.mutate()}
        >
          {summarize.isPending ? '다시 요약하는 중…' : '다시 요약'}
        </Button>
      </div>

      {summary.truncated && (
        <p className="typography-subtext-small text-on-surface-variant">
          회의록이 길어 앞부분만 요약했어요. 뒤쪽 내용은 반영되지 않았을 수
          있어요.
        </p>
      )}

      {summary.summary && (
        <p className="typography-body-medium whitespace-pre-line text-on-surface">
          {summary.summary}
        </p>
      )}

      {summary.decisions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className="typography-label-small text-on-surface-variant">
            결정 사항
          </h3>
          <ul className="list-disc pl-5 typography-body-medium text-on-surface">
            {summary.decisions.map((decision, index) => (
              <li key={`${index}-${decision}`}>{decision}</li>
            ))}
          </ul>
        </div>
      )}

      {summary.actionItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="typography-label-small text-on-surface-variant">
              할 일
            </h3>
            {canCreate && (
              <span className="typography-subtext-small text-on-surface-variant">
                {repoLabel(repo)}에 만들어요
              </span>
            )}
          </div>
          <ul className="flex flex-col gap-2">
            {summary.actionItems.map((item, index) => (
              <li
                key={`${index}-${item.title}`}
                className="flex items-start justify-between gap-3 rounded-xl bg-surface p-3"
              >
                <div className="min-w-0">
                  <p className="typography-label-medium text-on-surface">
                    {item.title}
                  </p>
                  {item.body && (
                    <p className="mt-0.5 typography-subtext-medium text-on-surface-variant">
                      {item.body}
                    </p>
                  )}
                </div>
                {canCreate && (
                  <Button
                    size="S"
                    variant="weak"
                    disabled={created.has(index) || createIssue.isPending}
                    onClick={() => createIssue.mutate({ item, index })}
                  >
                    {created.has(index) ? '만들었어요' : '이슈로 만들기'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {lookupDone && !canCreate && (
            <p className="typography-subtext-small text-on-surface-variant">
              프로젝트에 GitHub 저장소를 연결하면 이슈로 만들 수 있어요.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
