import { type NextRequest, NextResponse } from 'next/server';

import {
  DESKTOP_APP_RELEASES_URL as RELEASES_URL,
  type DesktopPlatform,
  detectDesktopPlatform,
  isDesktopPlatform,
} from '@/shared/lib/desktop-platform';

const LATEST_RELEASE_API =
  'https://api.github.com/repos/team-cowork/cowork-desktop-app-client/releases/latest';

const INSTALLER_EXTENSIONS: Record<DesktopPlatform, string> = {
  'macos-arm64': '.dmg',
  'macos-x64': '.dmg',
  windows: '.exe',
};

// 파일 이름에 CPU가 드러난 Mac 빌드를 고를 때 쓴다.
const ARCHITECTURE_PATTERNS: Partial<Record<DesktopPlatform, RegExp>> = {
  'macos-arm64': /arm64|aarch64|apple[-_ ]?silicon/i,
  'macos-x64': /x64|x86[-_]64|intel/i,
};

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

function pickInstaller(
  assets: ReleaseAsset[],
  platform: DesktopPlatform,
): ReleaseAsset | undefined {
  const installers = assets.filter((asset) =>
    asset.name.toLowerCase().endsWith(INSTALLER_EXTENSIONS[platform]),
  );
  const pattern = ARCHITECTURE_PATTERNS[platform];
  const matched = pattern
    ? installers.filter((asset) => pattern.test(asset.name))
    : [];
  if (matched.length === 1) return matched[0];
  // CPU 구분 없이 하나뿐이면 모든 CPU에서 도는 빌드로 본다.
  return installers.length === 1 ? installers[0] : undefined;
}

// 설치 파일 이름에 버전이 붙어 고정 주소가 없으므로, 최신 릴리스에서 운영체제에 맞는 설치 파일을 찾아 바로 내려받게 한다.
// ?platform=macos-arm64|macos-x64|windows가 없으면 User-Agent로 판단하고, 그래도 모르면 Windows로 본다.
// GitHub API는 비로그인 호출 횟수 제한이 있어 결과를 10분간 캐시하고, 맞는 파일을 하나로 고르지 못하거나 실패하면 릴리스 페이지로 보낸다.
export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get('platform');
  const platform = isDesktopPlatform(requested)
    ? requested
    : detectDesktopPlatform(request.headers.get('user-agent') ?? '');

  try {
    const response = await fetch(LATEST_RELEASE_API, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 600 },
    });
    if (response.ok) {
      const release: { assets?: ReleaseAsset[] } = await response.json();
      const installer = pickInstaller(release.assets ?? [], platform);
      if (installer) {
        return NextResponse.redirect(installer.browser_download_url);
      }
    }
  } catch {
    // 아래에서 릴리스 페이지로 보낸다.
  }
  return NextResponse.redirect(RELEASES_URL);
}
