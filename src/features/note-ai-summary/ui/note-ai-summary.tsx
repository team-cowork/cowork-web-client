'use client';

import { useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { githubQueries } from '@/entities/github/api/github-queries';
import { postGithubIssue } from '@/entities/github/api/post-github-issue';
import { type MeetingNoteSectionView } from '@/entities/meeting-note/model/meeting-note';
import { postNoteSummary } from '@/features/note-ai-summary/api/post-note-summary';
import {
  type ActionItem,
  type NoteSummary,
} from '@/features/note-ai-summary/model/note-summary';
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

/** 회의록 AI 요약과, 요약에서 뽑은 할 일을 GitHub 이슈로 만드는 버튼. */
export function NoteAiSummary({
  channelId,
  title,
  sections,
}: NoteAiSummaryProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState<NoteSummary | null>(null);
  const [created, setCreated] = useState<ReadonlySet<number>>(new Set());

  const { data: channel } = useQuery(channelQueries.detail(channelId));
  const projectId = channel?.projectId ?? null;
  const { data: repos } = useQuery({
    ...githubQueries.projectRepos(projectId ?? 0),
    enabled: projectId !== null,
  });
  const repo = repos?.[0] ?? null;

  const text = toPromptText(sections);

  const summarize = useMutation({
    mutationFn: () => postNoteSummary({ title, content: text }),
    onSuccess: setSummary,
    onError: () =>
      toast('AI 요약을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'),
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
    onError: () => toast('이슈를 만들지 못했어요.'),
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

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-variant/40 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="typography-title-small text-on-surface">AI 요약</h2>
        <Button
          size="S"
          variant="weak"
          color="neutral"
          disabled={summarize.isPending}
          onClick={() => summarize.mutate()}
        >
          {summarize.isPending ? '다시 요약하는 중…' : '다시 요약'}
        </Button>
      </div>

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
            {summary.decisions.map((decision) => (
              <li key={decision}>{decision}</li>
            ))}
          </ul>
        </div>
      )}

      {summary.actionItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="typography-label-small text-on-surface-variant">
            할 일
          </h3>
          <ul className="flex flex-col gap-2">
            {summary.actionItems.map((item, index) => (
              <li
                key={item.title}
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
          {!canCreate && (
            <p className="typography-subtext-small text-on-surface-variant">
              프로젝트에 GitHub 저장소를 연결하면 이슈로 만들 수 있어요.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
