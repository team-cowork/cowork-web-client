'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { userQueries } from '@/entities/user/api/user-queries';
import { ProfileCard } from '@/entities/user/ui/profile-card';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

export interface MyProfileProps {
  onEdit?: () => void;
}

function MyProfileError() {
  return (
    <ErrorState
      title="프로필을 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
    />
  );
}

export function MyProfile({ onEdit }: MyProfileProps) {
  return (
    <QueryBoundary
      loadingFallback={<LoadingPane />}
      errorFallback={MyProfileError}
    >
      <MyProfileContent onEdit={onEdit} />
    </QueryBoundary>
  );
}

function MyProfileContent({ onEdit }: MyProfileProps) {
  const { data: user } = useSuspenseQuery(userQueries.me());

  return <ProfileCard user={user} onEdit={onEdit} />;
}
