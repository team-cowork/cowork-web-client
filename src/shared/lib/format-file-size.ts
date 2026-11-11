const UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/** 바이트 수를 `1.2 MB`처럼 읽기 쉬운 크기로 바꾼다. */
export function formatFileSize(bytes: number): string {
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < UNITS.length - 1) {
    size /= 1024;
    unit += 1;
  }

  const rounded = unit === 0 || size >= 10 ? Math.round(size) : size.toFixed(1);
  return `${rounded} ${UNITS[unit]}`;
}
