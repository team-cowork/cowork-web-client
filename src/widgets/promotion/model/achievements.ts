import snapshot from '@/widgets/promotion/model/achievements-snapshot.json';

/** 개발 성과 페이지에 보여 주는 숫자 */
export interface AchievementSummary {
  /** 최근 6개월 동안 바뀐 줄 수(추가 + 삭제, 병합 커밋 제외) */
  changedLines: number;
  additions: number;
  deletions: number;
  /** 모든 공개 저장소 기본 브랜치의 전체 커밋 수 */
  commits: number;
  /** 병합된 PR이 가장 많았던 한 주의 PR 수 */
  peakPullRequests: number;
  /** 최근 6개월 동안 커밋한 사람(봇·AI 계정 제외) */
  contributorLogins: string[];
}

/** GitHub에서 모으지 못했을 때 보여 줄, 프로모션 사이트가 마지막으로 모아 둔 값 */
export const ACHIEVEMENT_SNAPSHOT: AchievementSummary = {
  changedLines: snapshot.totals.changedLines,
  additions: snapshot.totals.additions,
  deletions: snapshot.totals.deletions,
  commits: snapshot.totals.commits,
  peakPullRequests: snapshot.peakWeek.pullRequests,
  contributorLogins: snapshot.contributors.map(({ login }) => login),
};
