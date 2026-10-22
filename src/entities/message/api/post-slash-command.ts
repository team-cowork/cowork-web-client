import { instance } from '@/shared/api/instance';
import { type SlashCommandRequest } from '@/entities/message/model/message';

/** 커맨드는 서버에서 비동기로 처리되며 결과는 채널 메시지로 돌아온다. */
export async function postSlashCommand(
  channelId: number,
  request: SlashCommandRequest,
): Promise<void> {
  await instance.post(
    `/chat/chat/channels/${channelId}/slash-commands`,
    request,
  );
}
