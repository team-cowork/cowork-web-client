'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postProfileImage } from '@/entities/user/api/post-profile-image';
import { userQueries } from '@/entities/user/api/user-queries';

export function useUploadProfileImage() {
  const queryClient = useQueryClient();
  const meQuery = userQueries.me();

  return useMutation({
    mutationFn: postProfileImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meQuery.queryKey }),
  });
}
