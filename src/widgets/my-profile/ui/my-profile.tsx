'use client';

import { Suspense } from 'react';

import { QueryErrorResetBoundary, useSuspenseQuery } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

import { userQueries } from '@/entities/user/api/user-queries';
import { ProfileCard } from '@/entities/user/ui/profile-card';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';

export interface MyProfileProps {
  onEdit?: () => void;
}

export function MyProfile({ onEdit }: MyProfileProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={() => (
            <ErrorState title="프로필을 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." />
          )}
        >
          <Suspense fallback={<LoadingPane />}>
            <MyProfileContent onEdit={onEdit} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

function MyProfileContent({ onEdit }: MyProfileProps) {
  const { data: user } = useSuspenseQuery(userQueries.me());

  return <ProfileCard user={user} onEdit={onEdit} />;
}
