'use client';

import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ACCESS_TOKEN_STORAGE_KEY } from '@/shared/model/token';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => axios.post('/api/auth/signout'),
    onSettled: () => {
      sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      queryClient.clear();
      window.location.replace('/signin');
    },
  });
}
