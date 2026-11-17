'use client';

import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { closeChatSocket } from '@/shared/api/chat-socket';
import { clearWsCookie } from '@/shared/api/ws-cookie';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/shared/model/token';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axios.post('/api/auth/signout');
      closeChatSocket();
      // 쿠키는 수명이 짧아 지우지 못해도 곧 만료되므로 로그아웃은 그대로 진행한다.
      await clearWsCookie().catch(() => undefined);
    },
    onSuccess: () => {
      sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      queryClient.clear();
      window.location.replace('/signin');
    },
  });
}
