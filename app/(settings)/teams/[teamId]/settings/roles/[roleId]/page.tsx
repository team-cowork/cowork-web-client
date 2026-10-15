'use client';

import { notFound, useParams } from 'next/navigation';

import { TeamRoleDetail } from '@/widgets/team-role-detail/ui/team-role-detail';
import { useRouteIds } from '@/shared/lib/use-route-ids';

function toRoleId(value: string | string[] | undefined): number | null {
  if (typeof value !== 'string') return null;

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export default function TeamSettingsRoleDetailPage() {
  const { teamId } = useRouteIds();
  const params = useParams<{ roleId?: string }>();
  const roleId = toRoleId(params.roleId);

  if (teamId === null || roleId === null) notFound();

  return <TeamRoleDetail teamId={teamId} roleId={roleId} />;
}
