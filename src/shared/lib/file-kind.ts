/**
 * 파일 아이콘과 미리보기는 MIME 타입이 아닌 확장자로 정한다.
 * 서버는 파일 형식을 제한하지 않고 받은 MIME 타입을 그대로 저장하므로,
 * 브라우저가 형식을 몰라 `application/octet-stream`으로 올라간 파일도 확장자로는 알아볼 수 있다.
 */
export type FileKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'code'
  | 'spreadsheet'
  | 'document'
  | 'other';

// 브라우저가 <img>로 바로 그릴 수 있는 비트맵 이미지.
// SVG는 같은 출처에서 열면 스크립트가 실행될 수 있어 미리보기에서 뺀다.
const PREVIEWABLE_IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
};

const EXTENSIONS_BY_KIND: Record<Exclude<FileKind, 'other'>, string[]> = {
  image: [
    ...Object.keys(PREVIEWABLE_IMAGE_TYPES),
    'svg',
    'ico',
    'heic',
    'heif',
    'tif',
    'tiff',
    'psd',
  ],
  video: ['mp4', 'm4v', 'mov', 'webm', 'mkv', 'avi', 'wmv'],
  audio: ['mp3', 'wav', 'ogg', 'oga', 'opus', 'm4a', 'aac', 'flac'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2', 'xz'],
  code: [
    'js',
    'jsx',
    'mjs',
    'cjs',
    'ts',
    'tsx',
    'json',
    'html',
    'css',
    'scss',
    'py',
    'java',
    'kt',
    'kts',
    'go',
    'rs',
    'c',
    'h',
    'cpp',
    'hpp',
    'cs',
    'rb',
    'php',
    'swift',
    'sh',
    'sql',
    'xml',
    'yml',
    'yaml',
    'toml',
  ],
  spreadsheet: ['xls', 'xlsx', 'csv', 'tsv', 'ods', 'numbers'],
  document: [
    'pdf',
    'txt',
    'md',
    'rtf',
    'doc',
    'docx',
    'odt',
    'hwp',
    'hwpx',
    'pages',
    'ppt',
    'pptx',
    'odp',
    'key',
  ],
};

const KIND_BY_EXTENSION = new Map(
  Object.entries(EXTENSIONS_BY_KIND).flatMap(([kind, extensions]) =>
    extensions.map((extension) => [extension, kind as FileKind] as const),
  ),
);

/** 마지막 점 뒤를 소문자로 돌려준다. `.env`처럼 점으로 시작하는 이름은 확장자가 없는 것으로 본다. */
export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

export function getFileKind(name: string): FileKind {
  return KIND_BY_EXTENSION.get(getFileExtension(name)) ?? 'other';
}

/**
 * 썸네일·미리보기로 그릴 수 있는 이미지면 확장자에 맞는 MIME 타입을, 아니면 `undefined`를 돌려준다.
 * 로컬 파일을 새 탭으로 열 때 이 타입으로 고정해, 확장자와 다른 형식으로 해석되지 않게 한다.
 */
export function getPreviewImageType(name: string): string | undefined {
  return PREVIEWABLE_IMAGE_TYPES[getFileExtension(name)];
}
