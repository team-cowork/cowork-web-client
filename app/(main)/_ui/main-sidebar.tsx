'use client';

import { useRouteIds } from '@/shared/lib/use-route-ids';
import { ChannelSidebar } from '@/widgets/channel-sidebar/ui/channel-sidebar';
import { DmSidebar } from '@/widgets/dm-sidebar/ui/dm-sidebar';
import { MyProfile } from '@/widgets/my-profile/ui/my-profile';
import { ProfileSettings } from '@/widgets/profile-settings/ui/profile-settings';
import { UserFooter } from '@/widgets/sidebar/ui/user-footer';

/**
 * 메인 화면 왼쪽 사이드바. 여러 위젯을 조합하므로 위젯이 아닌 app 레이어에 둔다.
 * 팀 화면이면 채널 목록, 아니면 DM 목록을 보여준다.
 */
export function MainSidebar() {
  const { teamId } = useRouteIds();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-surface">
      {teamId === null ? <DmSidebar /> : <ChannelSidebar teamId={teamId} />}
      <UserFooter
        renderProfile={(onEdit) => <MyProfile onEdit={onEdit} />}
        settings={<ProfileSettings />}
      />
    </aside>
  );
}
