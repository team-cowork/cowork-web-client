import axios from 'axios';

import { type WebhookModeCooldown } from '@/entities/webhook/model/webhook';

export function isWebhookCooldownError(error: unknown): error is {
  response: {
    status: 429;
    data: { data: WebhookModeCooldown };
  };
} {
  if (!axios.isAxiosError(error) || error.response?.status !== 429) {
    return false;
  }

  const data: unknown = error.response.data;
  if (typeof data !== 'object' || data === null || !('data' in data)) {
    return false;
  }

  const cooldown = data.data;
  return (
    typeof cooldown === 'object' &&
    cooldown !== null &&
    'reason' in cooldown &&
    cooldown.reason === 'MODE_CHANGE_COOLDOWN' &&
    'nextAllowedAt' in cooldown &&
    typeof cooldown.nextAllowedAt === 'string'
  );
}
