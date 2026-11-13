import { instance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type Webhook } from '@/entities/webhook/model/webhook';

export async function getWebhooks(channelId: number): Promise<Webhook[]> {
  const { data } = await instance.get<ApiResponse<Webhook[]>>(
    `/channel/channels/${channelId}/webhooks`,
  );

  return data.data;
}
