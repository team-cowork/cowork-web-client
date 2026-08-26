import { type AvatarTone } from '@/shared/ui/avatar';

const AUTHOR_TONES: AvatarTone[] = [
  'blue',
  'green',
  'amber',
  'red',
  'neutral',
  'default',
];

/**
 * 프로필 이미지가 없는 작성자에게 이름 기반으로 아바타 색을 고정 배정한다.
 * 같은 작성자는 어느 화면에서든 같은 색을 갖는다.
 */
export function toAuthorTone(authorName: string): AvatarTone {
  const seed = [...authorName].reduce(
    (acc, char) => acc + char.codePointAt(0)!,
    0,
  );

  return AUTHOR_TONES[seed % AUTHOR_TONES.length]!;
}
