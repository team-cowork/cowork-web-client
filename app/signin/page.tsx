import Link from 'next/link';

import { HOME_PATH } from '@/shared/model/paths';
import { CoworkLogo } from '@/shared/ui/icons/cowork-logo';

const DATAGSM_LOGO_RECTS = [
  [0, 0, 10],
  [0, 2, 4],
  [8, 2, 4],
  [0, 4, 4],
  [10, 4, 4],
  [0, 6, 4],
  [10, 6, 4],
  [0, 8, 4],
  [10, 8, 4],
  [0, 10, 4],
  [8, 10, 4],
  [0, 12, 10],
] as const;

export default function SigninPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex w-full max-w-[460px] flex-col items-center gap-5 rounded-3xl bg-surface px-12 pt-12 pb-10">
        <CoworkLogo className="h-14 w-auto text-primary" />

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="typography-title-large text-on-surface">cowork</h1>
          <p className="typography-body-x-small break-keep text-on-surface-variant">
            광주소프트웨어마이스터고등학교 학생들이 만드는
            <br />
            협업 관리 플랫폼
          </p>
        </div>

        <div className="h-2 w-full" />

        <form action="/api/auth/signin" className="w-full">
          <button
            type="submit"
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-4 rounded-lg border border-[#E5E5E5] bg-[#EFEFEF] px-3 text-sm font-medium text-black transition-all duration-200 ease-in-out hover:bg-[#E5E5E5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="currentColor"
              aria-hidden="true"
            >
              {DATAGSM_LOGO_RECTS.map(([x, y, w]) => (
                <rect key={`${x}-${y}`} x={x} y={y} width={w} height={2} />
              ))}
            </svg>
            DataGSM으로 로그인
          </button>
        </form>

        <p className="typography-subtext-medium text-on-surface-variant">
          DataGSM 계정으로 로그인하세요
        </p>
      </div>

      <Link
        href={HOME_PATH}
        className="typography-subtext-medium text-on-surface-variant transition-colors hover:text-on-surface"
      >
        cowork 소개 보기
      </Link>
    </div>
  );
}
