'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProfileImage } from '@/entities/user/api/delete-profile-image';
import { readMyUser, writeMyUser } from '@/entities/user/lib/user-cache';

export function useDeleteProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProfileImage,
    onSuccess: () => {
      const previous = readMyUser(queryClient);
      if (previous) {
        writeMyUser(queryClient, { ...previous, profile_image_url: null });
      }
    },
  });
}
