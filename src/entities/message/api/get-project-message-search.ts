import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type SearchMessagesPage,
  type SearchMessagesParams,
} from '@/entities/message/model/message';

/** 프로젝트에 속한 채널 중 내가 읽을 수 있는 채널의 메시지를 검색한다. */
export async function getProjectMessageSearch(
  projectId: number,
  params: SearchMessagesParams,
): Promise<SearchMessagesPage> {
  const { data } = await instance.get<ApiResponse<SearchMessagesPage>>(
    `/chat/chat/projects/${projectId}/messages/search`,
    { params },
  );

  return data.data;
}
