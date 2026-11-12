'use client';

// TODO(임시): 발표용 칸반의 열 이동. 열은 '진행중' 라벨 유무로 정해서, 옮기면 라벨을 바꾼다.
// 서버가 이슈 상태를 주게 되면 이 폴더를 지운다.
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { patchGithubIssueLabels } from '@/entities/github/api/patch-github-issue-labels';
import { type GithubIssueSummary } from '@/entities/github/model/github';
import {
  labelsForStatus,
  type IssueStatus,
} from '@/entities/issue/model/issue';
import { useToast } from '@/shared/ui/toast-provider';

export function useMoveIssue(projectId: number, repoId: number) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      issue,
      status,
    }: {
      issue: GithubIssueSummary;
      status: IssueStatus;
    }) =>
      patchGithubIssueLabels(
        projectId,
        repoId,
        issue.number,
        labelsForStatus(issue.labels, status),
      ),
    onSuccess: () => {
      // 서버가 202로 접수만 확인한다. GitHub에 반영됐는지는 GitHub에서 확인한다.
      toast('라벨 변경을 요청했어요. 결과는 GitHub에서 확인해 주세요');
    },
    onError: (error) => {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      toast(
        status === 403
          ? '이 프로젝트를 수정할 권한이 없어요.'
          : '이슈를 옮기지 못했어요. 다시 시도해 주세요.',
      );
    },
  });
}
