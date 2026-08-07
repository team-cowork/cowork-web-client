'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchMyStatus } from '@/entities/user/api/patch-my-status';
import { userQueries } from '@/entities/user/api/user-queries';
import { type User } from '@/entities/user/model/user';

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  const meQuery = userQueries.me();

  return useMutation({
    mutationFn: patchMyStatus,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: meQuery.queryKey });
      const previous = queryClient.getQueryData<User>(meQuery.queryKey);

      queryClient.setQueryData<User>(meQuery.queryKey, (prev) =>
        prev
          ? { ...prev, status: variables.status, status_message: variables.message ?? null }
          : prev,
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData<User>(meQuery.queryKey, context.previous);
    },
    onSuccess: (user) => {
      queryClient.setQueryData<User>(meQuery.queryKey, user);
    },
  });
}
