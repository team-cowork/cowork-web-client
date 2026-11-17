'use client';

import { useState } from 'react';

import { type ProfileBasicValues } from '@/features/profile-edit/ui/profile-basic-fields';
import { useUpdateProfile } from '@/features/profile-edit/model/use-update-profile';
import { type ProfileImageDraft } from '@/features/profile-image/model/profile-image-draft';
import { useDeleteProfileImage } from '@/features/profile-image/model/use-delete-profile-image';
import { useUploadProfileImage } from '@/features/profile-image/model/use-upload-profile-image';

export type SaveStepResult = 'skipped' | 'saved' | 'failed';

export interface ProfileSaveResult {
  image: SaveStepResult;
  fields: SaveStepResult;
}

async function runStep(
  task: (() => Promise<unknown>) | undefined,
): Promise<SaveStepResult> {
  if (!task) return 'skipped';

  try {
    await task();
    return 'saved';
  } catch {
    return 'failed';
  }
}

/**
 * 프로필 사진과 기본 정보를 저장 버튼 하나로 저장한다.
 * 한쪽이 실패해도 다른 쪽은 저장하고, 어느 쪽이 실패했는지 돌려준다.
 */
export function useSaveProfile() {
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadProfileImage();
  const deleteImage = useDeleteProfileImage();
  const [isPending, setIsPending] = useState(false);

  const save = async ({
    image,
    fields,
  }: {
    image: ProfileImageDraft;
    /** 바뀌지 않았으면 비워 둔다 */
    fields?: ProfileBasicValues;
  }): Promise<ProfileSaveResult> => {
    setIsPending(true);
    try {
      // 기본 정보 수정 응답에도 사진 주소가 들어 있어, 함께 보내면 늦게 온 응답이 바뀐 사진을 덮어쓸 수 있다.
      // 사진을 먼저 저장해 수정 응답이 새 사진 상태를 담게 한다.
      const imageResult = await runStep(
        image.type === 'upload'
          ? () => uploadImage.mutateAsync(image.file)
          : image.type === 'remove'
            ? () => deleteImage.mutateAsync()
            : undefined,
      );
      const fieldsResult = await runStep(
        fields ? () => updateProfile.mutateAsync(fields) : undefined,
      );

      return { image: imageResult, fields: fieldsResult };
    } finally {
      setIsPending(false);
    }
  };

  return { save, isPending };
}
