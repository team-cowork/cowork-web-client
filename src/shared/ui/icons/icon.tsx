import { type ReactNode, type SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** width/height를 동시에 지정 (기본 24) */
  size?: number;
}

/** 공통 SVG 래퍼. 모든 아이콘의 반복 속성(viewBox·stroke·linecap 등)을 한 곳에서 관리. */
export function Icon({
  size = 24,
  strokeWidth = 2,
  children,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}
