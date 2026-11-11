import { instance } from '@/shared/api/instance';

export async function deleteWebhook(
  channelId: number,
  webhookId: number,
): Promise<void> {
  await instance.delete(`/channel/channels/${channelId}/webhooks/${webhookId}`);
}
