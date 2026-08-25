'use client';

import { ChannelSidebar } from '@/widgets/channel-sidebar/ui/channel-sidebar';
import { DmSidebar } from '@/widgets/dm-sidebar/ui/dm-sidebar';
import { useRouteIds } from '@/shared/lib/use-route-ids';

export interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const { teamId } = useRouteIds();

  if (teamId === null) return <DmSidebar className={className} />;

  return <ChannelSidebar teamId={teamId} className={className} />;
}
