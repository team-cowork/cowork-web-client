'use client';

import { useRef } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { deleteWebhook } from '@/entities/webhook/api/delete-webhook';
import { patchWebhook } from '@/entities/webhook/api/patch-webhook';
import { postWebhookExecutionId } from '@/entities/webhook/api/post-webhook-execution-id';
import { putWebhookSecurityMode } from '@/entities/webhook/api/put-webhook-security-mode';
import { webhookQueries } from '@/entities/webhook/api/webhook-queries';
import { isWebhookCooldownError } from '@/entities/webhook/lib/webhook-error';
import { type UpdateWebhookRequest } from '@/entities/webhook/model/webhook';
import { createUuid } from '@/shared/lib/create-uuid';
import { useToast } from '@/shared/ui/toast-provider';

export function useWebhookMutations(
  channelId: number,
  webhookId: number,
  onToken: (token: string) => void,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const securitySubmission = useRef<{ isSecure: boolean; key: string } | null>(
    null,
  );
  const executionKey = useRef<string | null>(null);
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: webhookQueries.list(channelId).queryKey,
    });
  const onError = (error: unknown) => {
    if (isWebhookCooldownError(error)) {
      const nextAllowedAt = new Date(error.response.data.data.nextAllowedAt);
      toast(
        `보안 모드는 ${nextAllowedAt.toLocaleString('ko-KR')}부터 다시 변경할 수 있어요.`,
      );
      return;
    }
    toast(
      axios.isAxiosError(error) && error.response?.status === 403
        ? '웹훅을 관리할 권한이 없어요'
        : '변경하지 못했어요. 다시 시도해 주세요.',
    );
  };

  const update = useMutation({
    mutationFn: async (request: UpdateWebhookRequest) => {
      await patchWebhook(channelId, webhookId, request);
    },
    onSuccess: () => {
      toast('웹훅을 수정했어요.');
      return invalidate();
    },
    onError,
  });
  const security = useMutation({
    mutationFn: async (isSecure: boolean) => {
      if (securitySubmission.current?.isSecure !== isSecure) {
        securitySubmission.current = { isSecure, key: createUuid() };
      }
      const webhook = await putWebhookSecurityMode(
        channelId,
        webhookId,
        { isSecure },
        securitySubmission.current.key,
      );
      securitySubmission.current = null;
      // 비밀키는 일회성 다이얼로그로만 전달하고 mutation 캐시에 담지 않는다.
      if (isSecure && webhook.token != null) onToken(webhook.token);
    },
    onSuccess: () => {
      toast('보안 모드를 변경했어요.');
      return invalidate();
    },
    onError: (error) => {
      if (isWebhookCooldownError(error)) securitySubmission.current = null;
      onError(error);
    },
  });
  const regenerate = useMutation({
    mutationFn: async () => {
      executionKey.current ??= createUuid();
      await postWebhookExecutionId(channelId, webhookId, executionKey.current);
      executionKey.current = null;
    },
    onSuccess: () => {
      toast('실행 URL을 재발급했어요. 새 URL을 복사해 사용해 주세요.');
      return invalidate();
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        executionKey.current = null;
      }
      onError(error);
    },
  });
  const remove = useMutation({
    mutationFn: () => deleteWebhook(channelId, webhookId),
    onSuccess: () => {
      toast('웹훅을 삭제했어요.');
      return invalidate();
    },
    onError,
  });

  return {
    update,
    security,
    regenerate,
    remove,
    isPending:
      update.isPending ||
      security.isPending ||
      regenerate.isPending ||
      remove.isPending,
  };
}
