import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import {
  type UpdateWebhookRequest,
  type Webhook,
} from '@/entities/webhook/model/webhook';

export async function patchWebhook(
  channelId: number,
  webhookId: number,
  request: UpdateWebhookRequest,
): Promise<Webhook> {
  const { data } = await instance.patch<ApiResponse<Webhook>>(
    `/channel/channels/${channelId}/webhooks/${webhookId}`,
    request,
  );

  return data.data;
}
