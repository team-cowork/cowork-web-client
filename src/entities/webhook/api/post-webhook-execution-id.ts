import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import { type Webhook } from '@/entities/webhook/model/webhook';

export async function postWebhookExecutionId(
  channelId: number,
  webhookId: number,
  idempotencyKey: string,
): Promise<Webhook> {
  const { data } = await instance.post<ApiResponse<Webhook>>(
    `/channel/channels/${channelId}/webhooks/${webhookId}/execution-id`,
    undefined,
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );

  return data.data;
}
