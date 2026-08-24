'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProfileBasicForm } from '@/features/profile-edit/ui/profile-basic-form';
import { ProfileImageField } from '@/features/profile-image/ui/profile-image-field';
import { userQueries } from '@/entities/user/api/user-queries';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingsCard } from '@/shared/ui/settings-card';

function ProfileSettingsError() {
  return (
    <ErrorState
      title="프로필을 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
    />
  );
}

export function ProfileSettings() {
  return (
    <QueryBoundary
      loadingFallback={<LoadingPane />}
      errorFallback={ProfileSettingsError}
    >
      <ProfileSettingsContent />
    </QueryBoundary>
  );
}

function ProfileSettingsContent() {
  const { data: user } = useSuspenseQuery(userQueries.me());

  return (
    <>
      <SettingsCard title="프로필 사진">
        <ProfileImageField user={user} />
      </SettingsCard>
      <SettingsCard title="기본 정보">
        <ProfileBasicForm user={user} />
      </SettingsCard>
    </>
  );
}
