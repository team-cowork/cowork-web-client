import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type GetMessagesParams,
  type Message,
} from '@/entities/message/model/message';

/** 서버가 한 번에 내려주는 메시지 수. 이보다 적게 오면 더 이전 메시지가 없다. */
export const MESSAGE_PAGE_SIZE = 100;

/** 최신 메시지부터 최대 {@link MESSAGE_PAGE_SIZE}개를 내려준다. */
export async function getMessages(
  channelId: number,
  params: GetMessagesParams = {},
): Promise<Message[]> {
  const { data } = await instance.get<ApiResponse<Message[]>>(
    `/chat/chat/channels/${channelId}/messages`,
    { params },
  );

  return data.data;
}
