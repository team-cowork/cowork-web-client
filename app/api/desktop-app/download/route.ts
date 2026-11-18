import { type NextRequest, NextResponse } from 'next/server';

import {
  DESKTOP_APP_RELEASES_URL as RELEASES_URL,
  type DesktopPlatform,
  detectDesktopPlatform,
  isDesktopPlatform,
} from '@/shared/lib/desktop-platform';

const LATEST_RELEASE_API =
  'https://api.github.com/repos/team-cowork/cowork-desktop-app-client/releases/latest';

const ARM64_PATTERN = /arm64|aarch64|apple[-_ ]?silicon/i;
const X64_PATTERN = /x64|x86[-_]64|intel/i;
const UNIVERSAL_PATTERN = /universal/i;
const CPU_PATTERNS = [ARM64_PATTERN, X64_PATTERN, UNIVERSAL_PATTERN];

interface InstallerRule {
  /** 앞에 있는 확장자부터 찾는다. */
  extensions: string[];
  /** 파일 이름에 이 플랫폼의 CPU가 드러난 빌드를 먼저 고른다. */
  architecture: RegExp;
  acceptsUniversal: boolean;
  /** CPU 표시가 없는 파일을 이 플랫폼용으로 받아도 되는지 */
  acceptsUnlabeled: boolean;
}

// 데스크톱 앱이 플랫폼별 빌드를 올리면 바로 이어지도록 미리 둔 규칙이다.
// 기대하는 이름: cowork-<버전>[-arm64].dmg, cowork-<버전>-x64.dmg, cowork-<버전>-universal.dmg, cowork-<버전>[-x64].exe|.msi
// CPU 표시가 없는 .dmg는 Apple Silicon 러너(macos-latest)에서 만든 지금의 빌드라 Intel Mac에는 주지 않는다.
const INSTALLER_RULES: Record<DesktopPlatform, InstallerRule> = {
  'macos-arm64': {
    extensions: ['.dmg'],
    architecture: ARM64_PATTERN,
    acceptsUniversal: true,
    acceptsUnlabeled: true,
  },
  'macos-x64': {
    extensions: ['.dmg'],
    architecture: X64_PATTERN,
    acceptsUniversal: true,
    acceptsUnlabeled: false,
  },
  windows: {
    extensions: ['.exe', '.msi'],
    architecture: X64_PATTERN,
    acceptsUniversal: false,
    acceptsUnlabeled: true,
  },
};

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

function pickInstaller(
  assets: ReleaseAsset[],
  platform: DesktopPlatform,
): ReleaseAsset | undefined {
  const { extensions, architecture, acceptsUniversal, acceptsUnlabeled } =
    INSTALLER_RULES[platform];
  for (const extension of extensions) {
    const installers = assets.filter((asset) =>
      asset.name.toLowerCase().endsWith(extension),
    );
    const labeled = installers.filter((asset) => architecture.test(asset.name));
    if (labeled.length === 1) return labeled[0];
    if (acceptsUniversal) {
      const universal = installers.filter((asset) =>
        UNIVERSAL_PATTERN.test(asset.name),
      );
      if (universal.length === 1) return universal[0];
    }
    if (!acceptsUnlabeled) continue;
    const unlabeled = installers.filter(
      (asset) => !CPU_PATTERNS.some((pattern) => pattern.test(asset.name)),
    );
    if (unlabeled.length === 1) return unlabeled[0];
  }
  return undefined;
}

// 설치 파일 이름에 버전이 붙어 고정 주소가 없으므로, 최신 릴리스에서 운영체제에 맞는 설치 파일을 찾아 바로 내려받게 한다.
// ?platform=macos-arm64|macos-x64|windows가 없으면 User-Agent로 판단하고, 그래도 모르면 Windows로 본다. 예전 링크의 ?platform=macos는 Mac으로 본다.
// Mac의 CPU는 Chromium이 보내는 Sec-CH-UA-Arch로 가리고, 없으면 Apple Silicon으로 본다.
// GitHub API는 비로그인 호출 횟수 제한이 있어 결과를 10분간 캐시하고, 맞는 파일을 하나로 고르지 못하거나(아직 빌드가 없는 플랫폼 포함) 실패하면 릴리스 페이지로 보낸다.
function resolvePlatform(request: NextRequest): DesktopPlatform {
  const requested = request.nextUrl.searchParams.get('platform');
  if (isDesktopPlatform(requested)) return requested;

  const detected =
    requested === 'macos'
      ? 'macos-arm64'
      : detectDesktopPlatform(request.headers.get('user-agent') ?? '');
  if (detected !== 'macos-arm64') return detected;
  return request.headers.get('sec-ch-ua-arch')?.includes('x86')
    ? 'macos-x64'
    : 'macos-arm64';
}

export async function GET(request: NextRequest) {
  const platform = resolvePlatform(request);

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
