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
 * 프로필 이미지가 없는 작성자에게 ID 기반으로 아바타 색을 고정 배정한다.
 * 이름을 불러오기 전에도 색이 바뀌지 않고, 같은 작성자는 어느 화면에서든 같은 색을 갖는다.
 */
export function toAuthorTone(authorId: number): AvatarTone {
  return AUTHOR_TONES[Math.abs(authorId) % AUTHOR_TONES.length]!;
}
