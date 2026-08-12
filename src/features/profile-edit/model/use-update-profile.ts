'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchMe } from '@/entities/user/api/patch-me';
import { writeMyUser } from '@/entities/user/lib/user-cache';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchMe,
    onSuccess: (user) => {
      writeMyUser(queryClient, user);
    },
  });
}
