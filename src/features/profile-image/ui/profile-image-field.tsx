'use client';

import { useRef, useState } from 'react';

import {
  KEEP_PROFILE_IMAGE,
  type ProfileImageDraft,
} from '@/features/profile-image/model/profile-image-draft';
import { type User } from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { Button } from '@/shared/ui/button';
import { LocalImage } from '@/shared/ui/local-image';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024;
const AVATAR_SIZE = 80;

export interface ProfileImageFieldProps {
  user: User;
  /** 저장 전 사진 변경. 고르거나 지워도 저장하기 전까지는 미리보기에만 반영한다. */
  draft: ProfileImageDraft;
  onChange: (draft: ProfileImageDraft) => void;
  disabled?: boolean;
}

export function ProfileImageField({
  user,
  draft,
  onChange,
  disabled = false,
}: ProfileImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const hasImage =
    draft.type === 'upload' ||
    (draft.type === 'keep' && Boolean(user.profile_image_url));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('JPG 또는 PNG 이미지만 올릴 수 있어요.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('5MB 이하 이미지만 올릴 수 있어요.');
      return;
    }

    setError('');
    onChange({ type: 'upload', file });
  };

  // 새로 고른 사진을 지우면 원래 사진으로 돌아가는 게 아니라 사진이 없는 상태가 된다.
  const handleRemove = () => {
    setError('');
    onChange(user.profile_image_url ? { type: 'remove' } : KEEP_PROFILE_IMAGE);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-[18px]">
        {draft.type === 'upload' ? (
          <span
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            className="inline-flex shrink-0 overflow-hidden rounded-full bg-surface-container"
          >
            <LocalImage
              file={draft.file}
              alt="새 프로필 사진 미리보기"
              className="size-full object-cover"
            />
          </span>
        ) : (
          <UserAvatar
            user={
              draft.type === 'remove'
                ? { ...user, profile_image_url: null }
                : user
            }
            size={AVATAR_SIZE}
            ringClassName="ring-surface"
            loading="eager"
          />
        )}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2.5">
            <Button
              size="S"
              variant="weak"
              color="neutral"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              이미지 변경
            </Button>
            <Button
              size="S"
              variant="weak"
              color="neutral"
              disabled={disabled || !hasImage}
              onClick={handleRemove}
            >
              제거
            </Button>
          </div>
          <p className="typography-subtext-small text-on-surface-variant">
            {draft.type === 'keep'
              ? 'JPG·PNG, 최대 5MB'
              : '저장을 눌러야 프로필 사진이 바뀌어요'}
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleChange}
        className="hidden"
      />
      {error && <p className="typography-subtext-medium text-error">{error}</p>}
    </div>
  );
}
