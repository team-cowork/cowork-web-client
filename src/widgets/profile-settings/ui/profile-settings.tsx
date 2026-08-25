'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { LogoutButton } from '@/features/logout/ui/logout-button';
import { ProfileBasicForm } from '@/features/profile-edit/ui/profile-basic-form';
import { ProfileImageField } from '@/features/profile-image/ui/profile-image-field';
import { userQueries } from '@/entities/user/api/user-queries';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingsCard } from '@/shared/ui/settings-card';
import { SettingsLayout } from '@/shared/ui/settings-layout';
import { SettingsNavItem } from '@/shared/ui/settings-nav-item';

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
    <SettingsLayout
      nav={
        <>
          <p className="truncate px-2.5 pb-4 typography-label-small text-on-surface">
            {user.name}
          </p>
          <ul className="flex flex-col gap-0.5">
            <li>
              <SettingsNavItem active>계정</SettingsNavItem>
            </li>
          </ul>
        </>
      }
      footer={
        <ul className="flex flex-col gap-0.5 border-t border-outline-variant pt-3">
          <li>
            <LogoutButton />
          </li>
        </ul>
      }
    >
      <SettingsCard title="프로필 사진">
        <ProfileImageField user={user} />
      </SettingsCard>
      <SettingsCard title="기본 정보">
        <ProfileBasicForm user={user} />
      </SettingsCard>
    </SettingsLayout>
  );
}
