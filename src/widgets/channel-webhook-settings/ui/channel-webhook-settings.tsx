'use client';

import { useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { isHttpStatus } from '@/shared/api/http-error';
import { webhookQueries } from '@/entities/webhook/api/webhook-queries';
import { toWebhookUrl } from '@/entities/webhook/lib/webhook-url';
import { CreateWebhookButton } from '@/features/webhook-create/ui/create-webhook-button';
import { WebhookManageActions } from '@/features/webhook-manage/ui/webhook-manage-actions';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { IconButton } from '@/shared/ui/icon-button';
import { CopyIcon } from '@/shared/ui/icons/copy-icon';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingsCard } from '@/shared/ui/settings-card';
import { TextField } from '@/shared/ui/text-field';
import { useToast } from '@/shared/ui/toast-provider';

function WebhookSettingsError({ error, resetErrorBoundary }: FallbackProps) {
  const forbidden = isHttpStatus(error, 403);

  return (
    <ErrorState
      title={
        forbidden ? '웹훅을 관리할 권한이 없어요' : '웹훅을 불러오지 못했어요'
      }
      description={
        forbidden
          ? '채널 관리자에게 권한을 확인해 주세요.'
          : '잠시 후 다시 시도해 주세요.'
      }
      action={
        !forbidden && <Button onClick={resetErrorBoundary}>다시 시도</Button>
      }
    />
  );
}

export function ChannelWebhookSettings({ channelId }: { channelId: number }) {
  return (
    <QueryBoundary
      loadingFallback={<LoadingPane />}
      errorFallback={WebhookSettingsError}
      resetKeys={[channelId]}
    >
      <ChannelWebhookSettingsContent key={channelId} channelId={channelId} />
    </QueryBoundary>
  );
}

function ChannelWebhookSettingsContent({ channelId }: { channelId: number }) {
  const { data: webhooks } = useSuspenseQuery(webhookQueries.list(channelId));
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  const copy = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast(message);
    } catch {
      toast('복사하지 못했어요. 값을 직접 선택해 복사해 주세요.');
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <SettingsCard title="채널 웹훅">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="typography-subtext-large text-on-surface-variant">
            외부 서비스에서 이 채널로 메시지를 보낼 수 있어요.
          </p>
          <CreateWebhookButton channelId={channelId} onToken={setToken} />
        </div>
        {webhooks.length === 0 ? (
          <EmptyState
            title="아직 웹훅이 없어요"
            description="웹훅을 만들어 외부 서비스의 알림을 받아보세요."
          />
        ) : (
          <ul className="flex min-w-0 flex-col divide-y divide-outline-variant">
            {webhooks.map((webhook) => {
              const url = toWebhookUrl(webhook.executionPath);
              return (
                <li
                  key={webhook.id}
                  className="flex min-w-0 flex-col gap-3 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="min-w-0 typography-body-medium-strong break-all text-on-surface">
                        {webhook.name}
                      </h3>
                      {webhook.isSecure && <Badge color="brand">보안</Badge>}
                    </div>
                    <WebhookManageActions
                      channelId={channelId}
                      webhook={webhook}
                      onToken={setToken}
                    />
                  </div>
                  <div className="flex min-w-0 items-center gap-2 rounded-xl border border-outline-variant p-3">
                    <p
                      className="min-w-0 flex-1 typography-subtext-medium break-all text-on-surface-variant select-all"
                      aria-label={`${webhook.name} 실행 URL`}
                    >
                      {url}
                    </p>
                    <IconButton
                      aria-label={`${webhook.name} 실행 URL 복사`}
                      size="S"
                      variant="clear"
                      onClick={() => void copy(url, '실행 URL을 복사했어요.')}
                    >
                      <CopyIcon size={16} />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SettingsCard>
      <Dialog
        open={token !== null}
        onClose={() => setToken(null)}
        dismissible={false}
        title="보안 토큰을 저장해 주세요"
        description="토큰은 지금 한 번만 보여드려요. 안전한 곳에 보관하고, 웹훅 실행 요청의 X-Webhook-Secret 헤더로 보내 주세요. 창을 닫으면 다시 볼 수 없어요."
      >
        {token !== null && (
          <div className="flex w-full min-w-0 flex-col gap-4">
            <TextField
              label="보안 토큰"
              value={token}
              readOnly
              autoComplete="off"
              spellCheck={false}
              onFocus={(event) => event.target.select()}
            />
            <div className="flex justify-end gap-2.5">
              <Button
                variant="weak"
                color="neutral"
                onClick={() => void copy(token, '보안 토큰을 복사했어요.')}
              >
                토큰 복사
              </Button>
              <Button onClick={() => setToken(null)}>확인</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
