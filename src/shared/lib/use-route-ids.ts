'use client';

import { useParams } from 'next/navigation';

function toId(value: string | string[] | undefined): number | null {
  if (typeof value !== 'string') return null;

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function useRouteIds(): {
  teamId: number | null;
  channelId: number | null;
} {
  const params = useParams<{ teamId?: string; channelId?: string }>();

  return { teamId: toId(params.teamId), channelId: toId(params.channelId) };
}
