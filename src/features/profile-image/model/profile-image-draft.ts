/** 원본 이미지에서 잘라 낼 정사각형. 원본 픽셀 기준이다. */
export interface ImageCrop {
  x: number;
  y: number;
  size: number;
}

/** 저장하기 전까지 들고 있는 프로필 사진 변경 */
export type ProfileImageDraft =
  | { type: 'keep' }
  | {
      type: 'upload';
      /** 위치를 맞춰 잘라 낸, 실제로 올릴 파일 */
      file: File;
      /** 위치를 다시 맞출 때 쓰는 원본 */
      source: File;
      crop: ImageCrop;
    }
  | { type: 'remove' };

export const KEEP_PROFILE_IMAGE: ProfileImageDraft = { type: 'keep' };
