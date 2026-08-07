'use client';

import { useQuery } from '@tanstack/react-query';

import { userQueries } from '@/entities/user/api/user-queries';
import { ProfileCard } from '@/entities/user/ui/profile-card';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';

export interface MyProfileProps {
  onEdit?: () => void;
}

export function MyProfile({ onEdit }: MyProfileProps) {
  const { data: user, isPending } = useQuery(userQueries.me());

  if (isPending) return <LoadingPane />;

  if (!user) {
    return (
      <ErrorState title="프로필을 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." />
    );
  }

  return <ProfileCard user={user} onEdit={onEdit} />;
}
