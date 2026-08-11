'use client';

import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchMyStatus } from '@/entities/user/api/patch-my-status';
import { userQueries } from '@/entities/user/api/user-queries';
import { type User } from '@/entities/user/model/user';

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  const meQuery = userQueries.me();
  const latestRequestId = useRef(0);

  return useMutation({
    mutationFn: patchMyStatus,
    onMutate: async (variables) => {
      const requestId = ++latestRequestId.current;
      await queryClient.cancelQueries({ queryKey: meQuery.queryKey });
      const previous = queryClient.getQueryData<User>(meQuery.queryKey);

      queryClient.setQueryData<User>(meQuery.queryKey, (prev) =>
        prev
          ? { ...prev, status: variables.status, status_message: variables.message ?? null }
          : prev,
      );

      return { previous, requestId };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous && context.requestId === latestRequestId.current) {
        queryClient.setQueryData<User>(meQuery.queryKey, context.previous);
      }
    },
    onSuccess: (user, _variables, context) => {
      if (context.requestId === latestRequestId.current) {
        queryClient.setQueryData<User>(meQuery.queryKey, user);
      }
    },
  });
}
