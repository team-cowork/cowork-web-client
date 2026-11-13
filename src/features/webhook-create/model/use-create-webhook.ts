'use client';

import { useRef } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isHttpStatus } from '@/shared/api/http-error';
import { postWebhook } from '@/entities/webhook/api/post-webhook';
import { webhookQueries } from '@/entities/webhook/api/webhook-queries';
import { type CreateWebhookRequest } from '@/entities/webhook/model/webhook';
import { createUuid } from '@/shared/lib/create-uuid';
import { useToast } from '@/shared/ui/toast-provider';

export function useCreateWebhook(
  channelId: number,
  onCreated: (token: string | null) => void,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const submission = useRef<{ signature: string; key: string } | null>(null);

  return useMutation({
    // 요청이 실패해도 같은 제출을 재시도할 수 있도록 키를 유지한다.
    mutationFn: async (request: CreateWebhookRequest) => {
      const signature = JSON.stringify(request);
      if (submission.current?.signature !== signature) {
        submission.current = { signature, key: createUuid() };
      }
      const webhook = await postWebhook(
        channelId,
        request,
        submission.current.key,
      );
      submission.current = null;
      // 비밀키는 React Query mutation 캐시에 저장하지 않는다.
      onCreated(webhook.token ?? null);
    },
    onSuccess: () => {
      toast('웹훅을 만들었어요.');
      return queryClient.invalidateQueries({
        queryKey: webhookQueries.list(channelId).queryKey,
      });
    },
    onError: (error) => {
      if (isHttpStatus(error, 409)) {
        submission.current = null;
      }
      toast('웹훅을 만들지 못했어요. 다시 시도해 주세요.');
    },
  });
}
