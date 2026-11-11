import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import {
  type UpdateWebhookSecurityModeRequest,
  type Webhook,
} from '@/entities/webhook/model/webhook';

export async function putWebhookSecurityMode(
  channelId: number,
  webhookId: number,
  request: UpdateWebhookSecurityModeRequest,
  idempotencyKey: string,
): Promise<Webhook> {
  const { data } = await instance.put<ApiResponse<Webhook>>(
    `/channel/channels/${channelId}/webhooks/${webhookId}/security-mode`,
    request,
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );

  return data.data;
}
