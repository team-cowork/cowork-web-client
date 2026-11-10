export interface Webhook {
  id: number;
  executionId: string;
  executionPath: string;
  channelId: number;
  name: string;
  avatarUrl?: string | null;
  isActive: boolean;
  isSecure: boolean;
  token?: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookRequest {
  name: string;
  avatarUrl?: string | null;
  isActive?: boolean;
  isSecure?: boolean;
}

export interface UpdateWebhookRequest {
  name?: string;
  avatarUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateWebhookSecurityModeRequest {
  isSecure: boolean;
}

export interface WebhookModeCooldown {
  reason: 'MODE_CHANGE_COOLDOWN';
  nextAllowedAt: string;
  retryAfterSeconds?: number;
}
