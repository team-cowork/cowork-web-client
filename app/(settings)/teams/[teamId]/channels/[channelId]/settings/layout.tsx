'use client';

import { type ReactNode } from 'react';

import { notFound, useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { ChannelSettingsNav } from '@/widgets/channel-settings-nav/ui/channel-settings-nav';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { channelPath } from '@/shared/model/paths';
import { CloseIcon } from '@/shared/ui/icons/close-icon';

export default function ChannelSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { teamId, channelId } = useRouteIds();
  const { data: channel } = useQuery({
    ...channelQueries.detail(channelId ?? 0),
    enabled: channelId !== null,
  });

  if (teamId === null || channelId === null) notFound();
  if (channel && channel.teamId !== teamId) notFound();

  return (
    <div className="flex min-h-dvh bg-surface-container-low max-md:flex-col">
      <ChannelSettingsNav
        teamId={teamId}
        channelId={channelId}
        channelName={channel?.name ?? ''}
      />

      <div className="relative flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-10 py-12 max-md:px-4 max-md:py-6">
          {children}
        </div>

        <button
          type="button"
          aria-label="설정 닫기"
          onClick={() => router.push(channelPath(teamId, channelId))}
          className="fixed top-6 right-6 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface max-md:top-3 max-md:right-4"
        >
          <CloseIcon size={18} />
        </button>
      </div>
    </div>
  );
}
