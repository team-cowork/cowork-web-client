import { collectAchievements } from '@/widgets/promotion/api/collect-achievements';
import {
  ACHIEVEMENT_SNAPSHOT,
  type AchievementSummary,
} from '@/widgets/promotion/model/achievements';

const COLLECT_TIMEOUT_MS = 120_000;

/**
 * GITHUB_TOKEN이 있으면 GitHub에서 새로 모으고, 없거나 실패하면 저장해 둔 스냅샷을 돌려준다.
 * 호출하는 페이지가 ISR(revalidate)로 결과를 캐시하므로 매 요청마다 모으지 않는다.
 */
export async function getAchievements(): Promise<AchievementSummary> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) return ACHIEVEMENT_SNAPSHOT;

  try {
    return await collectAchievements(
      token,
      AbortSignal.timeout(COLLECT_TIMEOUT_MS),
    );
  } catch (error) {
    console.warn(
      '개발 성과를 GitHub에서 모으지 못해 스냅샷을 보여 줍니다.',
      error instanceof Error ? error.message : error,
    );
    return ACHIEVEMENT_SNAPSHOT;
  }
}
