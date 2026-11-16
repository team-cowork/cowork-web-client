'use client';

import { useSyncExternalStore } from 'react';

import {
  DESKTOP_PLATFORM_LABELS,
  type DesktopPlatform,
  detectDesktopPlatform,
} from '@/shared/lib/desktop-platform';
import { DESKTOP_APP_DOWNLOAD_URL } from '@/widgets/promotion/model/promotion-content';

const RELEASES_URL =
  'https://github.com/team-cowork/cowork-desktop-app-client/releases/latest';

const subscribe = () => () => {};

function readPlatform(): DesktopPlatform | 'other' {
  // 터치를 지원하는 "Mac"은 iPad라 데스크톱 설치 대상이 아니다.
  if (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)) {
    return 'other';
  }
  return detectDesktopPlatform(navigator.userAgent) ?? 'other';
}

/**
 * 접속한 기기의 운영체제에 맞는 설치 파일(macOS .dmg, Windows .exe)을 바로 받게 한다.
 * 서버 렌더링 때는 운영체제를 모르므로 릴리스 페이지로 연결해 두고, 브라우저에서 바꾼다.
 */
export function DesktopDownloadButton({ className }: { className?: string }) {
  const platform = useSyncExternalStore(
    subscribe,
    readPlatform,
    () => undefined,
  );

  if (platform === undefined || platform === 'other') {
    return (
      <a
        href={RELEASES_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        데스크톱 앱 받기
      </a>
    );
  }

  return (
    <a
      href={`${DESKTOP_APP_DOWNLOAD_URL}?platform=${platform}`}
      className={className}
    >
      데스크톱 앱 설치 ({DESKTOP_PLATFORM_LABELS[platform]})
    </a>
  );
}
