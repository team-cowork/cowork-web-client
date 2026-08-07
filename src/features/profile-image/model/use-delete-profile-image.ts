'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProfileImage } from '@/entities/user/api/delete-profile-image';
import { userQueries } from '@/entities/user/api/user-queries';
import { type User } from '@/entities/user/model/user';

export function useDeleteProfileImage() {
  const queryClient = useQueryClient();
  const meQuery = userQueries.me();

  return useMutation({
    mutationFn: deleteProfileImage,
    onSuccess: () => {
      queryClient.setQueryData<User>(meQuery.queryKey, (prev) =>
        prev ? { ...prev, profile_image_url: null } : prev,
      );
    },
  });
}
