'use client';

import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchMyStatus } from '@/entities/user/api/patch-my-status';
import {
  cancelMyUserQueries,
  readMyUser,
  writeMyUser,
} from '@/entities/user/lib/user-cache';

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  const latestRequestId = useRef(0);

  return useMutation({
    mutationFn: patchMyStatus,
    onMutate: async (variables) => {
      const requestId = ++latestRequestId.current;
      const previous = readMyUser(queryClient);
      await cancelMyUserQueries(queryClient, previous?.id);

      if (previous) {
        writeMyUser(queryClient, {
          ...previous,
          status: variables.status,
          status_message: variables.message ?? null,
        });
      }

      return { previous, requestId };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous && context.requestId === latestRequestId.current) {
        writeMyUser(queryClient, context.previous);
      }
    },
    onSuccess: (user, _variables, context) => {
      if (context.requestId === latestRequestId.current) {
        writeMyUser(queryClient, user);
      }
    },
  });
}
