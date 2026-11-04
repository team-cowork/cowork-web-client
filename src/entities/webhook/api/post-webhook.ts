import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/token';
import {
  type CreateWebhookRequest,
  type Webhook,
} from '@/entities/webhook/model/webhook';

export async function postWebhook(
  channelId: number,
  request: CreateWebhookRequest,
  idempotencyKey: string,
): Promise<Webhook> {
  const { data } = await instance.post<ApiResponse<Webhook>>(
    `/channel/channels/${channelId}/webhooks`,
    request,
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );

  return data.data;
}
