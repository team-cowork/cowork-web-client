import { instance } from '@/shared/api/instance';
import { type CreateThreadRequest } from '@/entities/message/model/message';

export async function postThread(
  channelId: number,
  request: CreateThreadRequest,
): Promise<void> {
  await instance.post(`/channel/channels/${channelId}/threads`, request);
}
