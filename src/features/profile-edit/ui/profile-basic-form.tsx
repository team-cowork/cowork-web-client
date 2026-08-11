'use client';

import { type SyntheticEvent, useState } from 'react';

import { useUpdateProfile } from '@/features/profile-edit/model/use-update-profile';
import { type User } from '@/entities/user/model/user';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';

export interface ProfileBasicFormProps {
  user: User;
}

export function ProfileBasicForm({ user }: ProfileBasicFormProps) {
  const [nickname, setNickname] = useState(user.nickname ?? '');
  const [description, setDescription] = useState(user.description ?? '');
  const [saved, setSaved] = useState(false);
  const updateProfile = useUpdateProfile();

  const dirty = nickname !== (user.nickname ?? '') || description !== (user.description ?? '');

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    setSaved(false);
    updateProfile.mutate(
      { nickname, description },
      { onSuccess: () => setSaved(true) },
    );
  };

  const handleReset = () => {
    setNickname(user.nickname ?? '');
    setDescription(user.description ?? '');
    setSaved(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <TextField
        label="닉네임"
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
        placeholder="닉네임을 입력하세요"
      />
      <TextField
        label="한 줄 소개"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="자신을 한 줄로 소개해 보세요"
      />
      {updateProfile.isError && (
        <p className="text-error typography-subtext-medium">
          저장하지 못했어요. 다시 시도해 주세요.
        </p>
      )}
      {saved && !dirty && (
        <p className="text-success typography-subtext-medium">저장했어요.</p>
      )}
      <div className="flex justify-end gap-2.5">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={!dirty || updateProfile.isPending}
          onClick={handleReset}
        >
          취소
        </Button>
        <Button type="submit" disabled={!dirty || updateProfile.isPending}>
          저장
        </Button>
      </div>
    </form>
  );
}
