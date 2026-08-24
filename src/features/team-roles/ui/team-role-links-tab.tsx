import { EmptyState } from '@/shared/ui/empty-state';
import { GlobeIcon } from '@/shared/ui/icons/globe-icon';

export function TeamRoleLinksTab() {
  return (
    <EmptyState
      icon={<GlobeIcon />}
      title="링크 설정은 준비 중이에요"
      description="서버에서 아직 지원하지 않는 기능이라, 곧 추가될 예정이에요"
    />
  );
}
