'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchMe } from '@/entities/user/api/patch-me';
import { userQueries } from '@/entities/user/api/user-queries';
import { type User } from '@/entities/user/model/user';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const meQuery = userQueries.me();

  return useMutation({
    mutationFn: patchMe,
    onSuccess: (user) => {
      queryClient.setQueryData<User>(meQuery.queryKey, user);
    },
  });
}
