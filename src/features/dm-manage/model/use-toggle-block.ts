'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteBlock } from '@/entities/dm/api/delete-block';
import { dmQueries } from '@/entities/dm/api/dm-queries';
import { postBlock } from '@/entities/dm/api/post-block';

/** 상대 사용자를 차단하거나 차단을 푼다. */
export function useToggleBlock(targetUserId: number | undefined) {
  const queryClient = useQueryClient();
  const { data: blocked } = useQuery(dmQueries.blocked());
  const isBlocked =
    targetUserId !== undefined && (blocked?.includes(targetUserId) ?? false);

  const mutation = useMutation({
    mutationFn: (userId: number) =>
      isBlocked ? deleteBlock(userId) : postBlock(userId),
    onSuccess: (_data, userId) => {
      queryClient.setQueryData<number[]>(dmQueries.blocked().queryKey, (ids) =>
        isBlocked
          ? ids?.filter((id) => id !== userId)
          : [...(ids ?? []), userId],
      );
    },
  });

  return {
    isBlocked,
    isPending: mutation.isPending,
    toggle: () => {
      if (targetUserId !== undefined) mutation.mutate(targetUserId);
    },
  };
}
