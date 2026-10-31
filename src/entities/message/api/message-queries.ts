import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { getAttachmentDownloadUrl } from '@/entities/message/api/get-attachment-download-url';
import { getChannelFiles } from '@/entities/message/api/get-channel-files';
import { getPins } from '@/entities/message/api/get-pins';
import { getProjectMessageSearch } from '@/entities/message/api/get-project-message-search';
import { getTeamMessageSearch } from '@/entities/message/api/get-team-message-search';
import { getTeamUnread } from '@/entities/message/api/get-team-unread';
import {
  getMessages,
  MESSAGE_PAGE_SIZE,
} from '@/entities/message/api/get-messages';
import { type SearchMessagesParams } from '@/entities/message/model/message';

const UNREAD_REFETCH_INTERVAL_MS = 30 * 1000;
// 첨부 URL은 60초 뒤 만료되므로 그보다 조금 일찍 새로 받는다.
const ATTACHMENT_URL_STALE_MS = 50 * 1000;

// 새 메시지·수정·삭제는 소켓 이벤트로 캐시에 직접 반영한다.
// 포커스 복귀 때 다시 받아오면 전송 중인 메시지가 사라지므로 끈다.
export const messageQueries = {
  all: () => ['message'] as const,
  byChannel: (channelId: number) =>
    infiniteQueryOptions({
      queryKey: [...messageQueries.all(), 'byChannel', channelId],
      queryFn: ({ pageParam }) => getMessages(channelId, { before: pageParam }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length < MESSAGE_PAGE_SIZE
          ? undefined
          : lastPage.findLast((message) => message.sendStatus === undefined)
              ?._id,
      staleTime: 0,
      refetchOnWindowFocus: false,
    }),
  replies: (channelId: number, parentMessageId: string) =>
    queryOptions({
      queryKey: [
        ...messageQueries.all(),
        'replies',
        channelId,
        parentMessageId,
      ],
      queryFn: () => getMessages(channelId, { parentMessageId }),
      staleTime: 0,
      refetchOnWindowFocus: false,
    }),
  pins: (channelId: number) =>
    queryOptions({
      queryKey: [...messageQueries.all(), 'pins', channelId],
      queryFn: () => getPins(channelId),
    }),
  channelFiles: (channelId: number) =>
    infiniteQueryOptions({
      queryKey: [...messageQueries.all(), 'files', channelId],
      queryFn: ({ pageParam }) => getChannelFiles(channelId, pageParam),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  /**
   * 이미지 미리보기에 쓰는 첨부 URL.
   * 서버가 캐시하지 말라고 내려주므로, 만료 뒤 다시 그릴 때는 새 URL을 받는다.
   * 이미 그린 이미지가 다시 받아지지 않도록 포커스 복귀 때는 갱신하지 않는다.
   */
  attachmentUrl: (
    channelId: number,
    messageId: string,
    attachmentIndex: number,
  ) =>
    queryOptions({
      queryKey: [
        ...messageQueries.all(),
        'attachmentUrl',
        channelId,
        messageId,
        attachmentIndex,
      ],
      queryFn: () =>
        getAttachmentDownloadUrl(channelId, messageId, attachmentIndex),
      staleTime: ATTACHMENT_URL_STALE_MS,
      refetchOnWindowFocus: false,
    }),
  /** `projectId`가 있으면 프로젝트 범위, 없으면 팀 전체에서 검색한다. */
  search: (
    scope: { teamId: number; projectId?: number },
    params: Omit<SearchMessagesParams, 'before'>,
  ) =>
    infiniteQueryOptions({
      queryKey: [...messageQueries.all(), 'search', scope, params],
      queryFn: ({ pageParam }) =>
        scope.projectId === undefined
          ? getTeamMessageSearch(scope.teamId, { ...params, before: pageParam })
          : getProjectMessageSearch(scope.projectId, {
              ...params,
              before: pageParam,
            }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: params.q.trim().length > 0,
    }),
  // 다른 채널에 새 메시지가 와도 서버가 알려주지 않아 주기적으로 다시 받는다.
  teamUnread: (teamId: number) =>
    queryOptions({
      queryKey: [...messageQueries.all(), 'unread', teamId],
      queryFn: () => getTeamUnread(teamId),
      refetchInterval: UNREAD_REFETCH_INTERVAL_MS,
    }),
} as const;
