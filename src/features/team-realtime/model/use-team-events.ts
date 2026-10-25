'use client';

import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { projectQueries } from '@/entities/project/api/project-queries';
import { getChatSocket } from '@/shared/api/chat-socket';

interface ChannelEvent {
  channelId: number;
  teamId: number;
}

interface ProjectEvent {
  projectId: number;
  teamId: number;
}

interface MembershipEvent {
  channelId: number;
  teamId?: number | null;
  userId: number;
}

const CHANNEL_EVENTS = [
  'channel:created',
  'channel:updated',
  'channel:deleted',
] as const;
const PROJECT_EVENTS = ['project:created', 'project:updated'] as const;
const MEMBERSHIP_EVENTS = [
  'member:joined',
  'member:left',
  'member:role:updated',
] as const;

/**
 * 팀 room에 참가해 채널·프로젝트·멤버 변경을 받아 관련 목록을 다시 불러온다.
 * 팀 화면이 떠 있는 동안 한 곳에서만 호출한다.
 */
export function useTeamEvents(teamId: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getChatSocket();
    const invalidate = (queryKey: readonly unknown[]) =>
      void queryClient.invalidateQueries({ queryKey });

    const join = () => socket.emit('join:team', { teamId });

    const handleChannel = ({ channelId, ...event }: ChannelEvent) => {
      if (event.teamId !== teamId) return;

      invalidate(channelQueries.byTeam(teamId).queryKey);
      invalidate(channelQueries.detail(channelId).queryKey);
      // 채널이 어느 프로젝트에 속하는지 이벤트로는 알 수 없어 프로젝트 채널 목록을 모두 갱신한다.
      invalidate([...projectQueries.all(), 'channels']);
    };

    const invalidateProjectLists = () => {
      invalidate(projectQueries.byTeam(teamId).queryKey);
      invalidate(projectQueries.mine().queryKey);
    };

    const handleProject = ({ projectId, ...event }: ProjectEvent) => {
      if (event.teamId !== teamId) return;

      invalidateProjectLists();
      invalidate(projectQueries.detail(projectId).queryKey);
      invalidate(projectQueries.members(projectId).queryKey);
    };

    // 삭제된 프로젝트의 상세·멤버는 다시 조회해도 404라 목록만 갱신한다.
    const handleProjectDeleted = (event: ProjectEvent) => {
      if (event.teamId === teamId) invalidateProjectLists();
    };

    const handleMembership = ({ channelId, ...event }: MembershipEvent) => {
      if (event.teamId != null && event.teamId !== teamId) return;

      invalidate(channelQueries.members(channelId).queryKey);
      // 내가 채널에 들어가거나 나가면 보이는 채널 목록이 바뀐다.
      invalidate(channelQueries.byTeam(teamId).queryKey);
    };

    const handleAccessRevoked = () => {
      invalidate(channelQueries.byTeam(teamId).queryKey);
    };

    socket.on('connect', join);
    CHANNEL_EVENTS.forEach((event) => socket.on(event, handleChannel));
    PROJECT_EVENTS.forEach((event) => socket.on(event, handleProject));
    socket.on('project:deleted', handleProjectDeleted);
    MEMBERSHIP_EVENTS.forEach((event) => socket.on(event, handleMembership));
    socket.on('channel:access:revoked', handleAccessRevoked);

    if (socket.connected) join();

    return () => {
      socket.off('connect', join);
      CHANNEL_EVENTS.forEach((event) => socket.off(event, handleChannel));
      PROJECT_EVENTS.forEach((event) => socket.off(event, handleProject));
      socket.off('project:deleted', handleProjectDeleted);
      MEMBERSHIP_EVENTS.forEach((event) => socket.off(event, handleMembership));
      socket.off('channel:access:revoked', handleAccessRevoked);

      if (socket.connected) socket.emit('leave:team', { teamId });
    };
  }, [teamId, queryClient]);
}
