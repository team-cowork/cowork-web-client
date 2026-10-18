import { instance } from '@/shared/api/instance';
import { type SendMessageRequest } from '@/entities/message/model/message';

/**
 * 메시지 전송은 서버에서 비동기로 처리되어 응답에 메시지가 없다.
 * 저장된 메시지는 소켓 `message` 이벤트로 도착한다.
 */
export async function postMessage(
  channelId: number,
  request: SendMessageRequest,
): Promise<void> {
  await instance.post(`/chat/chat/channels/${channelId}/messages`, request);
}
