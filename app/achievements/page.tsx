import { publicPageMetadata } from '@/shared/lib/page-metadata';
import { ACHIEVEMENTS_PATH } from '@/shared/model/paths';
import { getAchievements } from '@/widgets/promotion/api/get-achievements';
import { AchievementStory } from '@/widgets/promotion/ui/achievements/achievement-story';
import { PromotionLayout } from '@/widgets/promotion/ui/promotion-layout';

export const metadata = publicPageMetadata({
  title: '개발 성과',
  description:
    '함께 만든 cowork. 코드의 변화부터 주간 최다 Pull Request, 기여자와 AI 활용까지 개발의 성과를 소개합니다.',
  path: ACHIEVEMENTS_PATH,
});

// GitHub에서 모으는 데 오래 걸리므로 한 시간마다 백그라운드에서 다시 만든다.
export const revalidate = 3600;

export default async function AchievementsPage() {
  const data = await getAchievements();
  return (
    <PromotionLayout>
      <AchievementStory data={data} />
    </PromotionLayout>
  );
}
