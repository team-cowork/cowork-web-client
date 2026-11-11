import { queryOptions } from '@tanstack/react-query';

import { getChannel } from '@/entities/channel/api/get-channel';
import { getChannelMembers } from '@/entities/channel/api/get-channel-members';
import { getChannelRolePolicies } from '@/entities/channel/api/get-channel-role-policies';
import { getSearchedChannels } from '@/entities/channel/api/get-searched-channels';
import { getTeamChannels } from '@/entities/channel/api/get-team-channels';
import { type SearchChannelsParams } from '@/entities/channel/model/channel';

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
  rolePolicies: (channelId: number) =>
    queryOptions({
      queryKey: [...channelQueries.all(), 'rolePolicies', channelId],
      queryFn: () => getChannelRolePolicies(channelId),
    }),
  search: (params: SearchChannelsParams) =>
    queryOptions({
      queryKey: [...channelQueries.all(), 'search', params],
      queryFn: () => getSearchedChannels(params),
    }),
} as const;
