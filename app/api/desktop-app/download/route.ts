import { NextResponse } from 'next/server';

const RELEASES_URL =
  'https://github.com/team-cowork/cowork-desktop-app-client/releases/latest';
const LATEST_RELEASE_API =
  'https://api.github.com/repos/team-cowork/cowork-desktop-app-client/releases/latest';

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

// 설치 파일 이름에 버전이 붙어 고정 주소가 없으므로, 최신 릴리스의 .dmg를 찾아 바로 내려받게 한다.
// GitHub API는 비로그인 호출 횟수 제한이 있어 결과를 10분간 캐시하고, 실패하면 릴리스 페이지로 보낸다.
export async function GET() {
  try {
    const response = await fetch(LATEST_RELEASE_API, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 600 },
    });
    if (response.ok) {
      const release: { assets?: ReleaseAsset[] } = await response.json();
      const dmg = release.assets?.find((asset) =>
        asset.name.toLowerCase().endsWith('.dmg'),
      );
      if (dmg) return NextResponse.redirect(dmg.browser_download_url);
    }
  } catch {
    // 아래에서 릴리스 페이지로 보낸다.
  }
  return NextResponse.redirect(RELEASES_URL);
}
