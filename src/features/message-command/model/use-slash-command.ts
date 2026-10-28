'use client';

import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { postSlashCommand } from '@/entities/message/api/post-slash-command';
import { type SlashCommandRequest } from '@/entities/message/model/message';

const ISSUE_COMMAND = /^\/issue(?:\s+(.*))?$/;

/** 커맨드로 보내지 못하는 이유 */
export type SlashCommandProblem = 'noProject' | 'noTitle';

export type ParsedSlashCommand =
  | { kind: 'none' }
  | { kind: 'invalid'; problem: SlashCommandProblem }
  | { kind: 'command'; request: SlashCommandRequest };

/**
 * `/issue 제목` (둘째 줄부터 본문)을 GitHub 이슈 생성 커맨드로 바꾼다.
 * 서버는 프로젝트 ID를 받아 그 프로젝트의 저장소에 이슈를 만들므로 프로젝트 채널에서만 쓸 수 있다.
 */
export function parseSlashCommand(
  content: string,
  projectId: number | null,
): ParsedSlashCommand {
  const [firstLine = '', ...rest] = content.split('\n');
  const match = ISSUE_COMMAND.exec(firstLine.trim());
  if (!match) return { kind: 'none' };

  if (projectId === null) return { kind: 'invalid', problem: 'noProject' };

  const title = match[1]?.trim();
  if (!title) return { kind: 'invalid', problem: 'noTitle' };

  const body = rest.join('\n').trim();
  return {
    kind: 'command',
    request: {
      command: 'github.issue.create',
      payload: { projectId, title, ...(body && { body }) },
    },
  };
}

/**
 * 입력이 슬래시 커맨드면 일반 메시지 대신 커맨드로 보낸다.
 * `run`은 커맨드로 보냈으면 `'sent'`, 커맨드지만 보낼 수 없으면 `'invalid'`,
 * 커맨드가 아니면 `'none'`을 돌려준다.
 */
export function useSlashCommand(channelId: number, projectId: number | null) {
  const [problem, setProblem] = useState<SlashCommandProblem | null>(null);
  const mutation = useMutation({
    mutationFn: (request: SlashCommandRequest) =>
      postSlashCommand(channelId, request),
  });

  const run = (content: string): 'sent' | 'invalid' | 'none' => {
    const parsed = parseSlashCommand(content, projectId);
    if (parsed.kind === 'none') return 'none';

    if (parsed.kind === 'invalid') {
      mutation.reset();
      setProblem(parsed.problem);
      return 'invalid';
    }

    setProblem(null);
    mutation.mutate(parsed.request);
    return 'sent';
  };

  const reset = () => {
    setProblem(null);
    mutation.reset();
  };

  return {
    run,
    problem,
    status: mutation.status,
    reset,
  };
}
