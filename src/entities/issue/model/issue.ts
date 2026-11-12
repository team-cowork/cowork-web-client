// TODO(임시): 발표용 임시 칸반. 서버 이슈 API(`/projects/{projectId}/github-repos/{repoId}/issues`)와
// 연동할 때 이 타입을 실제 응답에 맞게 바꾸거나 이 파일째 지운다.

export type IssueStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE';

export const ISSUE_STATUSES: IssueStatus[] = ['PLANNED', 'IN_PROGRESS', 'DONE'];

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  PLANNED: '계획됨',
  IN_PROGRESS: '진행중',
  DONE: '완료됨',
};

export type IssueLabelColor = 'neutral' | 'green' | 'blue' | 'amber' | 'red';

export interface IssueLabel {
  name: string;
  color: IssueLabelColor;
}

export interface Issue {
  id: number;
  title: string;
  labels: IssueLabel[];
  /** MM.DD 형식의 마감일. 없으면 표시하지 않는다. */
  dueDate?: string;
  /** 담당자 이름. 아바타에는 첫 글자를 쓴다. */
  assignee?: string;
}
