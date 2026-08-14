import { queryOptions } from '@tanstack/react-query';

import { getChannel } from '@/entities/channel/api/get-channel';
import { getChannelMembers } from '@/entities/channel/api/get-channel-members';
import { getTeamChannels } from '@/entities/channel/api/get-team-channels';

export const channelQueries = {
  all: () => ['channel'] as const,
  byTeam: (teamId: number) =>
    queryOptions({
      queryKey: [...channelQueries.all(), 'byTeam', teamId],
      queryFn: () => getTeamChannels(teamId),
    }),
  detail: (channelId: number) =>
    queryOptions({
      queryKey: [...channelQueries.all(), 'detail', channelId],
      queryFn: () => getChannel(channelId),
    }),
  members: (channelId: number) =>
    queryOptions({
      queryKey: [...channelQueries.all(), 'members', channelId],
      queryFn: () => getChannelMembers(channelId),
    }),
} as const;
