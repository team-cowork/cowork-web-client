'use client';

import { useEffect, useId, useState, useSyncExternalStore } from 'react';

import { cn } from '@/shared/lib/cn';
import {
  DESKTOP_PLATFORM_LABELS,
  DESKTOP_PLATFORMS,
  type DesktopPlatform,
  detectDesktopPlatform,
} from '@/shared/lib/desktop-platform';
import { useEscapeToClose } from '@/shared/lib/use-escape-to-close';
import { ChevronDownIcon } from '@/shared/ui/icons/chevron-down-icon';
import { DownloadIcon } from '@/shared/ui/icons/download-icon';
import { Menu, MenuBackdrop } from '@/shared/ui/menu';
import { DESKTOP_APP_DOWNLOAD_URL } from '@/widgets/promotion/model/promotion-content';

const subscribe = () => () => {};

function readPlatform(): DesktopPlatform {
  // 터치를 지원하는 "Mac"은 iPad라 데스크톱 설치 대상이 아니므로, 알 수 없는 기기처럼 Windows로 둔다.
  if (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)) {
    return 'windows';
  }
  return detectDesktopPlatform(navigator.userAgent);
}

interface NavigatorUserAgentData {
  getHighEntropyValues(hints: string[]): Promise<{ architecture?: string }>;
}

function getUserAgentData() {
  return (navigator as Navigator & { userAgentData?: NavigatorUserAgentData })
    .userAgentData;
}

function resolveMacPlatform(
  detected: DesktopPlatform | undefined,
  architecture: string | undefined,
): DesktopPlatform | undefined {
  if (detected !== 'macos-arm64' || !getUserAgentData()) return detected;
  if (architecture === undefined) return undefined;
  return architecture === 'x86' ? 'macos-x64' : 'macos-arm64';
}

function downloadUrl(platform: DesktopPlatform) {
  return `${DESKTOP_APP_DOWNLOAD_URL}?platform=${platform}`;
}

/**
 * 접속한 기기의 운영체제에 맞는 설치 파일을 바로 받게 하고, 오른쪽 화살표 메뉴로 다른 운영체제용 파일도 고를 수 있게 한다.
 * 서버 렌더링 때는 운영체제를 모르므로 다운로드 라우트가 User-Agent로 고르게 두고, 브라우저에서 바꾼다.
 */
export function DesktopDownloadButton({ className }: { className?: string }) {
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [macArchitecture, setMacArchitecture] = useState<string>();
  const detected = useSyncExternalStore(
    subscribe,
    readPlatform,
    () => undefined,
  );
  const platform = resolveMacPlatform(detected, macArchitecture);

  // Chromium 계열 브라우저는 CPU 종류를 알려 주므로 Intel Mac을 가려낸다. Safari·Firefox는 알려 주지 않아 Apple Silicon으로 둔다.
  useEffect(() => {
    if (detected !== 'macos-arm64') return;
    getUserAgentData()
      ?.getHighEntropyValues(['architecture'])
      .then(({ architecture }) => setMacArchitecture(architecture ?? ''))
      .catch(() => setMacArchitecture(''));
  }, [detected]);

  useEscapeToClose(menuOpen, () => setMenuOpen(false));

  return (
    <div className="relative inline-flex">
      <a
        href={platform ? downloadUrl(platform) : DESKTOP_APP_DOWNLOAD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(className, 'rounded-r-none')}
      >
        <DownloadIcon size={16} />
        {platform
          ? `데스크톱 앱 설치 (${DESKTOP_PLATFORM_LABELS[platform]})`
          : '데스크톱 앱 설치'}
      </a>
      <button
        type="button"
        aria-label="다른 운영체제용 설치 파일 고르기"
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? menuId : undefined}
        className={cn(
          className,
          'cursor-pointer rounded-l-none border-l border-current/20 px-3',
        )}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <ChevronDownIcon size={16} />
      </button>

      {menuOpen && (
        <>
          <MenuBackdrop onClick={() => setMenuOpen(false)} />
          <div
            className="absolute top-full right-0 z-50 mt-2"
            onClick={() => setMenuOpen(false)}
          >
            <Menu id={menuId} role="group" aria-label="운영체제별 설치 파일">
              {DESKTOP_PLATFORMS.map((option) => (
                <a
                  key={option}
                  href={downloadUrl(option)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2 typography-subtext-large text-on-surface transition-colors hover:bg-surface-container"
                >
                  <DownloadIcon size={16} className="text-on-surface-variant" />
                  {DESKTOP_PLATFORM_LABELS[option]}
                </a>
              ))}
            </Menu>
          </div>
        </>
      )}
    </div>
  );
}
