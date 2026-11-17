export type DesktopPlatform = 'macos' | 'windows';

export const DESKTOP_APP_RELEASES_URL =
  'https://github.com/team-cowork/cowork-desktop-app-client/releases/latest';

export const DESKTOP_PLATFORM_LABELS: Record<DesktopPlatform, string> = {
  macos: 'macOS',
  windows: 'Windows',
};

/** 데스크톱 설치 파일을 고를 운영체제. 휴대폰·태블릿과 그 밖의 운영체제는 undefined다. */
export function detectDesktopPlatform(
  userAgent: string,
): DesktopPlatform | undefined {
  // iPadOS는 데스크톱 Safari처럼 "Macintosh"를 보내므로 터치 기기 여부는 브라우저 쪽에서 따로 본다.
  if (/iPhone|iPad|iPod|Android/i.test(userAgent)) return undefined;
  if (/Windows/i.test(userAgent)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macos';
  return undefined;
}
