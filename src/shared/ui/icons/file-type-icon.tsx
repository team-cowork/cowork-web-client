import { type ReactNode } from 'react';

import { type FileKind } from '@/shared/lib/file-kind';
import { Icon, type IconProps } from '@/shared/ui/icons/icon';

// 문서 모양 안에 그릴 종류별 표시
const GLYPHS: Record<FileKind, ReactNode> = {
  image: (
    <>
      <circle cx="10" cy="11" r="1.5" />
      <path d="m19 16-2.6-2.6a1.5 1.5 0 0 0-2.1 0L8 19.5" />
    </>
  ),
  video: <path d="m10 11 4.5 2.5L10 16z" />,
  audio: (
    <>
      <circle cx="10" cy="16.5" r="1.5" />
      <path d="M11.5 16.5V10l3 1.5" />
    </>
  ),
  archive: (
    <>
      <path d="M11 6h1M12 8h1M11 10h1M12 12h1" />
      <rect x="10.5" y="14" width="3" height="3.5" rx="0.5" />
    </>
  ),
  code: (
    <>
      <path d="m10 12-2 2 2 2" />
      <path d="m14 12 2 2-2 2" />
    </>
  ),
  spreadsheet: (
    <>
      <rect x="8" y="11" width="8" height="7" rx="0.5" />
      <path d="M8 14.5h8M12 11v7" />
    </>
  ),
  document: <path d="M9 9h2M9 13h6M9 17h6" />,
  other: null,
};

export interface FileTypeIconProps extends IconProps {
  kind: FileKind;
}

/** 파일 종류에 맞는 표시를 얹은 파일 아이콘 */
export function FileTypeIcon({ kind, ...props }: FileTypeIconProps) {
  return (
    <Icon {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      {GLYPHS[kind]}
    </Icon>
  );
}
