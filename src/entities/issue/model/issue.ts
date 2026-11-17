// TODO(임시): 발표용 임시 칸반. 서버 이슈에는 상태가 없고 열린 이슈만 와서, 라벨로 열을 나눈다.
// 서버가 이슈 상태를 주게 되면 라벨 규칙(IN_PROGRESS_LABELS)과 이 파일을 지운다.

export type IssueStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE';

export const ISSUE_STATUSES: IssueStatus[] = ['PLANNED', 'IN_PROGRESS', 'DONE'];

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  PLANNED: '계획됨',
  IN_PROGRESS: '진행중',
  DONE: '완료됨',
};

/** 이 라벨이 붙은 이슈를 진행중으로 본다. 새로 붙일 때는 첫 번째 이름을 쓴다. */
const IN_PROGRESS_LABELS = ['진행중', 'in progress'];

const isInProgressLabel = (label: string) =>
  IN_PROGRESS_LABELS.includes(label.trim().toLowerCase());

/** 열린 이슈의 열. 닫힌 이슈는 서버가 주지 않아 완료됨은 항상 비어 있다. */
export function issueStatusOf(labels: string[]): IssueStatus {
  return labels.some(isInProgressLabel) ? 'IN_PROGRESS' : 'PLANNED';
}

/** 열을 옮길 때 서버에 보낼 라벨 전체. 진행중 라벨만 넣고 빼고 나머지는 그대로 둔다. */
export function labelsForStatus(
  labels: string[],
  status: IssueStatus,
): string[] {
  const rest = labels.filter((label) => !isInProgressLabel(label));
  return status === 'IN_PROGRESS' ? [...rest, IN_PROGRESS_LABELS[0]] : rest;
}
