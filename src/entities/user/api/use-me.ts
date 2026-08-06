'use client';

import { useQuery } from '@tanstack/react-query';

import { type User } from '@/entities/user/model/user';

export const meQueryKey = ['users', 'me'] as const;

async function fetchMe(): Promise<User> {
  const response = await fetch('/api/users/me');
  if (!response.ok) throw new Error('내 정보를 불러오지 못했습니다');

  return response.json();
}

export function useMe() {
  return useQuery({ queryKey: meQueryKey, queryFn: fetchMe });
}
