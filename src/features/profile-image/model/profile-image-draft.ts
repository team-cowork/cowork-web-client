/** 저장하기 전까지 들고 있는 프로필 사진 변경 */
export type ProfileImageDraft =
  { type: 'keep' } | { type: 'upload'; file: File } | { type: 'remove' };

export const KEEP_PROFILE_IMAGE: ProfileImageDraft = { type: 'keep' };
