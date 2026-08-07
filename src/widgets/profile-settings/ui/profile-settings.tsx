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

  return (
    <section className="bg-surface-container-high flex flex-1 flex-col">
      <header className="border-outline-variant flex h-14 shrink-0 items-center gap-2 border-b px-6">
        <h1 className="text-on-surface text-[1.125rem] font-semibold">설정</h1>
        <p className="text-on-surface-variant typography-subtext-large">· 프로필</p>
      </header>
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-7">
        <div className="flex w-[640px] max-w-full flex-col gap-4">
          {isPending && <LoadingPane />}
          {!isPending &&
            (user ? (
              <>
                <SettingsCard title="프로필 사진">
                  <ProfileImageField user={user} />
                </SettingsCard>
                <SettingsCard title="기본 정보">
                  <ProfileBasicForm user={user} />
                </SettingsCard>
              </>
            ) : (
              <ErrorState
                title="프로필을 불러오지 못했어요"
                description="잠시 후 다시 시도해 주세요."
              />
            ))}
        </div>
      </div>
    </section>
  );
}
