'use client';

import { useRef, useState } from 'react';

import { useDeleteProfileImage } from '@/features/profile-image/model/use-delete-profile-image';
import { useUploadProfileImage } from '@/features/profile-image/model/use-upload-profile-image';
import { type User } from '@/entities/user/model/user';
import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { Button } from '@/shared/ui/button';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024;

export interface ProfileImageFieldProps {
  user: User;
}

export function ProfileImageField({ user }: ProfileImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const upload = useUploadProfileImage();
  const remove = useDeleteProfileImage();

  const pending = upload.isPending || remove.isPending;

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
    upload.mutate(file, {
      onError: () => setError('이미지를 올리지 못했어요. 다시 시도해 주세요.'),
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-[18px]">
        <UserAvatar
          user={user}
          size={80}
          ringClassName="ring-surface"
          loading="eager"
        />
        <div className="flex flex-col gap-2">
          <div className="flex gap-2.5">
            <Button
              size="S"
              variant="weak"
              color="neutral"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
            >
              이미지 변경
            </Button>
            <Button
              size="S"
              variant="weak"
              color="neutral"
              disabled={pending || !user.profile_image_url}
              onClick={() =>
                remove.mutate(undefined, {
                  onError: () =>
                    setError('이미지를 지우지 못했어요. 다시 시도해 주세요.'),
                })
              }
            >
              제거
            </Button>
          </div>
          <p className="typography-subtext-small text-on-surface-variant">
            JPG·PNG, 최대 5MB
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
