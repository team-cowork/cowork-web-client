'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postProfileImage } from '@/entities/user/api/post-profile-image';
import { invalidateMyUser } from '@/entities/user/lib/user-cache';

export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postProfileImage,
    onSuccess: () => invalidateMyUser(queryClient),
  });
}
