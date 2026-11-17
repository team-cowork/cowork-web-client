import { type ImageCrop } from '@/features/profile-image/model/profile-image-draft';

// 아바타는 크게 보여도 이 정도면 충분하고, 올리는 파일도 작아진다.
const OUTPUT_SIZE = 512;
const JPEG_QUALITY = 0.92;

/**
 * 원본 이미지에서 `crop` 영역을 정사각형 파일로 잘라 낸다.
 * 원본보다 크게 늘리지 않고, PNG는 투명도를 지키도록 PNG로, 나머지는 JPEG로 저장한다.
 */
export async function cropToSquare(
  image: HTMLImageElement,
  crop: ImageCrop,
  source: File,
): Promise<File> {
  const size = Math.max(1, Math.min(OUTPUT_SIZE, Math.round(crop.size)));
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('이미지를 자를 수 없습니다');

  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.size,
    crop.size,
    0,
    0,
    size,
    size,
  );

  const type = source.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, JPEG_QUALITY),
  );
  if (!blob) throw new Error('이미지를 자를 수 없습니다');

  return new File([blob], source.name, { type });
}
