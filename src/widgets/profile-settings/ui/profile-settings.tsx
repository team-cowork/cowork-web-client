'use client';

import { useQuery } from '@tanstack/react-query';

import { ProfileBasicForm } from '@/features/profile-edit/ui/profile-basic-form';
import { ProfileImageField } from '@/features/profile-image/ui/profile-image-field';
import { userQueries } from '@/entities/user/api/user-queries';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { SettingsCard } from '@/shared/ui/settings-card';

export function ProfileSettings() {
  const { data: user, isPending } = useQuery(userQueries.me());

  if (isPending) return <LoadingPane />;

  if (!user) {
    return (
      <ErrorState title="프로필을 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." />
    );
  }

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
