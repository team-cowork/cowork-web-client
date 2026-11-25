'use client';

import { usePathname } from 'next/navigation';

import { ChannelSidebar } from '@/widgets/channel-sidebar/ui/channel-sidebar';
import { DmSidebar } from '@/widgets/dm-sidebar/ui/dm-sidebar';
import { MyProfile } from '@/widgets/my-profile/ui/my-profile';
import { ProfileSettings } from '@/widgets/profile-settings/ui/profile-settings';
import { UserFooter } from '@/widgets/sidebar/ui/user-footer';
import { TeamRail } from '@/widgets/team-rail/ui/team-rail';
import { cn } from '@/shared/lib/cn';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { useMobileNavStore } from '@/shared/model/mobile-nav-store';
import { HOME_PATH } from '@/shared/model/paths';

/**
 * 메인 화면 왼쪽 사이드바. 여러 위젯을 조합하므로 위젯이 아닌 app 레이어에 둔다.
 * 팀 화면이면 채널 목록, 아니면 DM 목록을 보여준다.
 */
export function MainSidebar() {
  const { teamId } = useRouteIds();
  const pathname = usePathname();
  const open = useMobileNavStore((state) => state.open);
  const setOpen = useMobileNavStore((state) => state.setOpen);
  const visible = open || pathname === HOME_PATH;

  return (
    <div
      className={cn(
        'flex shrink-0 max-md:fixed max-md:inset-0 max-md:z-30',
        !visible && 'max-md:hidden',
      )}
    >
      <TeamRail />
      <aside
        className="flex w-60 shrink-0 flex-col bg-surface max-md:w-auto max-md:flex-1"
        onClick={(event) => {
          if ((event.target as Element).closest('a')) setOpen(false);
        }}
      >
        {teamId === null ? <DmSidebar /> : <ChannelSidebar teamId={teamId} />}
        <UserFooter
          renderProfile={(onEdit) => <MyProfile onEdit={onEdit} />}
          settings={<ProfileSettings />}
        />
      </aside>
    </div>
  );
}
