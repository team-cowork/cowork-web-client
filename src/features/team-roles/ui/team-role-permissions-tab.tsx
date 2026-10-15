import { EmptyState } from '@/shared/ui/empty-state';
import { SettingsIcon } from '@/shared/ui/icons/settings-icon';

export function TeamRolePermissionsTab() {
  return (
    <EmptyState
      icon={<SettingsIcon />}
      title="권한 설정은 준비 중이에요"
      description="서버에서 아직 지원하지 않는 기능이라, 곧 추가될 예정이에요"
    />
  );
}
