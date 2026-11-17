export type DesktopPlatform = 'macos-arm64' | 'macos-x64' | 'windows';

export const DESKTOP_PLATFORMS: DesktopPlatform[] = [
  'macos-arm64',
  'macos-x64',
  'windows',
];

export const DESKTOP_APP_RELEASES_URL =
  'https://github.com/team-cowork/cowork-desktop-app-client/releases/latest';

export const DESKTOP_PLATFORM_LABELS: Record<DesktopPlatform, string> = {
  'macos-arm64': 'Apple Silicon Mac',
  'macos-x64': 'Intel Mac',
  windows: 'Windows',
};

export function isDesktopPlatform(value: unknown): value is DesktopPlatform {
  return DESKTOP_PLATFORMS.includes(value as DesktopPlatform);
}

/**
 * 데스크톱 설치 파일을 고를 운영체제. 알아낼 수 없으면(휴대폰·태블릿·그 밖의 운영체제) Windows로 둔다.
 * User-Agent로는 Mac의 CPU를 구분할 수 없어 Mac은 Apple Silicon으로 본다.
 */
export function detectDesktopPlatform(userAgent: string): DesktopPlatform {
  // iPhone도 "like Mac OS X"를 보내므로 먼저 거른다. iPadOS는 데스크톱 Safari처럼 "Macintosh"를 보내므로 터치 기기 여부는 브라우저 쪽에서 따로 본다.
  if (/iPhone|iPad|iPod|Android/i.test(userAgent)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macos-arm64';
  return 'windows';
}
