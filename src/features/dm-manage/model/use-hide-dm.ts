'use client';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteDm } from '@/entities/dm/api/delete-dm';
import { dmQueries } from '@/entities/dm/api/dm-queries';
import { type DmConversation } from '@/entities/dm/model/dm';
import { HOME_PATH } from '@/shared/model/paths';

/** 대화를 목록에서 숨기고 DM 홈으로 나간다. */
export function useHideDm(channelId: number) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteDm(channelId),
    onSuccess: () => {
      queryClient.setQueryData<DmConversation[]>(
        dmQueries.list().queryKey,
        (dms) => dms?.filter((dm) => dm.channelId !== channelId),
      );
      router.push(HOME_PATH);
    },
  });
}
