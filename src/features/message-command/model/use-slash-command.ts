'use client';

import { useMutation } from '@tanstack/react-query';

import { postSlashCommand } from '@/entities/message/api/post-slash-command';
import { type SlashCommandRequest } from '@/entities/message/model/message';

const ISSUE_COMMAND = /^\/issue\s+(.+)$/;

/**
 * `/issue 제목` (둘째 줄부터 본문)을 GitHub 이슈 생성 커맨드로 바꾼다.
 * 프로젝트에 속하지 않은 채널이거나 형식이 맞지 않으면 `null`.
 */
export function parseSlashCommand(
  content: string,
  projectId: number | null,
): SlashCommandRequest | null {
  if (projectId === null) return null;

  const [firstLine = '', ...rest] = content.split('\n');
  const title = ISSUE_COMMAND.exec(firstLine.trim())?.[1]?.trim();
  if (!title) return null;

  const body = rest.join('\n').trim();
  return {
    command: 'github.issue.create',
    payload: { projectId, title, ...(body && { body }) },
  };
}

/**
 * 입력이 슬래시 커맨드면 일반 메시지 대신 커맨드로 보낸다.
 * `run`이 `true`를 돌려주면 커맨드로 처리된 것이다.
 */
export function useSlashCommand(channelId: number, projectId: number | null) {
  const mutation = useMutation({
    mutationFn: (request: SlashCommandRequest) =>
      postSlashCommand(channelId, request),
  });

  const run = (content: string) => {
    const request = parseSlashCommand(content, projectId);
    if (!request) return false;

    mutation.mutate(request);
    return true;
  };

  return {
    run,
    status: mutation.status,
    reset: mutation.reset,
  };
}
