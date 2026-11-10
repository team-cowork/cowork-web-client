'use client';

import { useQuery } from '@tanstack/react-query';

import { userQueries } from '@/entities/user/api/user-queries';

export interface MessageAuthor {
  name: string;
  imageUrl?: string;
}

const UNKNOWN_AUTHOR_NAME = '알 수 없는 사용자';

/**
 * 메시지에는 작성자 ID만 있어 사용자 정보를 따로 불러온다.
 * 같은 작성자는 쿼리 캐시를 공유하므로 메시지 수만큼 요청이 나가지 않는다.
 */
export function useMessageAuthor(authorId: number): MessageAuthor {
  const { data: user, isError } = useQuery(userQueries.detail(authorId));

  if (!user) return { name: isError ? UNKNOWN_AUTHOR_NAME : '' };

  return {
    name: user.nickname ?? user.name,
    imageUrl: user.profile_image_url ?? undefined,
  };
}
