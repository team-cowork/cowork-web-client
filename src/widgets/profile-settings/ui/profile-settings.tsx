'use client';

import { type SyntheticEvent, useEffect, useState } from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';

import { LogoutButton } from '@/features/logout/ui/logout-button';
import {
  ProfileBasicFields,
  type ProfileBasicValues,
} from '@/features/profile-edit/ui/profile-basic-fields';
import {
  KEEP_PROFILE_IMAGE,
  type ProfileImageDraft,
} from '@/features/profile-image/model/profile-image-draft';
import { ProfileImageField } from '@/features/profile-image/ui/profile-image-field';
import { userQueries } from '@/entities/user/api/user-queries';
import {
  supportsProfileBanner,
  toProfileBannerColor,
} from '@/entities/user/model/profile-banner';
import { type UpdateMeRequest, type User } from '@/entities/user/model/user';
import {
  type ProfileSaveResult,
  useSaveProfile,
} from '@/widgets/profile-settings/model/use-save-profile';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';
import { SettingsCard } from '@/shared/ui/settings-card';
import { SettingsLayout } from '@/shared/ui/settings-layout';
import { SettingsNavItem } from '@/shared/ui/settings-nav-item';

function ProfileSettingsFooter() {
  return (
    <ul className="flex flex-col gap-0.5 border-t border-outline-variant pt-3">
      <li>
        <LogoutButton />
      </li>
    </ul>
  );
}

function ProfileSettingsError() {
  return (
    <SettingsLayout
      nav={
        <ul className="flex flex-col gap-0.5">
          <li>
            <SettingsNavItem active>계정</SettingsNavItem>
          </li>
        </ul>
      }
      footer={<ProfileSettingsFooter />}
    >
      <ErrorState
        title="프로필을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
      />
    </SettingsLayout>
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
      footer={<ProfileSettingsFooter />}
    >
      <ProfileEditForm user={user} />
    </SettingsLayout>
  );
}

function toBasicValues(user: User): ProfileBasicValues {
  return {
    nickname: user.nickname ?? '',
    description: user.description ?? '',
    bannerColor: toProfileBannerColor(user.banner_color),
  };
}

function resultMessage({ image, fields }: ProfileSaveResult) {
  if (image !== 'failed' && fields !== 'failed') {
    return { text: '저장했어요.', error: false };
  }
  if (image === 'failed' && fields === 'saved') {
    return {
      text: '기본 정보는 저장했지만 프로필 사진은 저장하지 못했어요. 다시 시도해 주세요.',
      error: true,
    };
  }
  if (fields === 'failed' && image === 'saved') {
    return {
      text: '프로필 사진은 저장했지만 기본 정보는 저장하지 못했어요. 다시 시도해 주세요.',
      error: true,
    };
  }

  return { text: '저장하지 못했어요. 다시 시도해 주세요.', error: true };
}

/**
 * 프로필 사진과 기본 정보를 한 폼으로 묶는다.
 * 사진을 고르거나 지워도 저장하기 전까지는 미리보기에만 반영하고, 저장·취소 버튼 하나로 함께 처리한다.
 */
function ProfileEditForm({ user }: { user: User }) {
  const [image, setImage] = useState<ProfileImageDraft>(KEEP_PROFILE_IMAGE);
  const [values, setValues] = useState(() => toBasicValues(user));
  const [result, setResult] = useState<ProfileSaveResult | null>(null);
  const { save, isPending } = useSaveProfile();

  const saved = toBasicValues(user);
  const bannerSupported = supportsProfileBanner(user);
  const bannerDirty =
    bannerSupported && values.bannerColor !== saved.bannerColor;
  const fieldsDirty =
    values.nickname !== saved.nickname ||
    values.description !== saved.description ||
    bannerDirty;
  const dirty = image.type !== 'keep' || fieldsDirty;

  // 저장하지 않은 변경이 있으면 새로고침·창 닫기 전에 브라우저 확인 창을 띄운다.
  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) =>
      event.preventDefault();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setResult(null);

    const fields: UpdateMeRequest | undefined = fieldsDirty
      ? {
          nickname: values.nickname,
          description: values.description,
          ...(bannerDirty && { banner_color: values.bannerColor }),
        }
      : undefined;
    const next = await save({ image, fields });
    // 저장된 사진은 서버 값으로 보여 주고, 실패한 사진은 다시 저장할 수 있게 남겨 둔다.
    if (next.image === 'saved') setImage(KEEP_PROFILE_IMAGE);
    setResult(next);
  };

  const handleReset = () => {
    setImage(KEEP_PROFILE_IMAGE);
    setValues(saved);
    setResult(null);
  };

  const message = result && resultMessage(result);

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="flex flex-col gap-3.5"
    >
      <SettingsCard title="프로필 사진">
        <ProfileImageField
          user={user}
          draft={image}
          onChange={(draft) => {
            setImage(draft);
            setResult(null);
          }}
          disabled={isPending}
        />
      </SettingsCard>
      <SettingsCard title="기본 정보">
        <ProfileBasicFields
          values={values}
          onChange={(next) => {
            setValues(next);
            setResult(null);
          }}
          bannerSupported={bannerSupported}
          disabled={isPending}
        />
      </SettingsCard>

      <div className="flex flex-wrap items-center justify-end gap-2.5">
        {message && (
          <p
            role={message.error ? 'alert' : 'status'}
            className={
              message.error
                ? 'mr-auto typography-subtext-medium text-error'
                : 'mr-auto typography-subtext-medium text-success'
            }
          >
            {message.text}
          </p>
        )}
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={!dirty || isPending}
          onClick={handleReset}
        >
          취소
        </Button>
        <Button type="submit" disabled={!dirty || isPending}>
          {isPending ? '저장 중…' : '저장'}
        </Button>
      </div>
    </form>
  );
}
