'use client';

import { useMutation } from '@tanstack/react-query';

import {
  type CreateGithubIssueRequest,
  postGithubIssue,
} from '@/entities/github/api/post-github-issue';

/** 프로젝트에 연결된 저장소에 이슈를 만든다. 서버가 접수만 확인하고 GitHub 에는 비동기로 만든다. */
export function useCreateGithubIssue(projectId: number, repoId: number) {
  return useMutation({
    mutationFn: (request: CreateGithubIssueRequest) =>
      postGithubIssue(projectId, repoId, request),
  });
}
