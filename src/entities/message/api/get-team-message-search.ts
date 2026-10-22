import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type SearchMessagesPage,
  type SearchMessagesParams,
} from '@/entities/message/model/message';

/** 팀에서 내가 읽을 수 있는 채널의 메시지를 검색한다. */
export async function getTeamMessageSearch(
  teamId: number,
  params: SearchMessagesParams,
): Promise<SearchMessagesPage> {
  const { data } = await instance.get<ApiResponse<SearchMessagesPage>>(
    '/chat/chat/search/messages',
    { params: { ...params, teamId } },
  );

  return data.data;
}
