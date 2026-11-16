import { type SVGProps } from 'react';

const LOGO_PATHS = [
  'M2930.29 2564L3479.71 2289.29H4578.57L4029.14 2564H2930.29Z',
  'M4578.57 2289.29V3388.14L4029.14 3662.86V2564L4578.57 2289.29Z',
  'M2930.29 2564V3662.86H4029.14V2564H2930.29Z',
  'M1831.43 1831.43L2380.86 1556.71H3479.71L2930.29 1831.43H1831.43Z',
  'M3479.71 1556.71V2655.57L2930.29 2930.29V1831.43L3479.71 1556.71Z',
  'M1831.43 1831.43V2930.29H2930.29V1831.43H1831.43Z',
  'M732.571 1098.86L1282 824.143H2380.86L1831.43 1098.86H732.571Z',
  'M2380.86 824.143V1923L1831.43 2197.71V1098.86L2380.86 824.143Z',
  'M732.571 1098.86V2197.71H1831.43V1098.86H732.571Z',
];

/** cowork 브랜드 마크. 색은 currentColor를 따르고, 크기는 width/className으로 정한다. */
export function CoworkLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="686 778 3939 2931" fill="none" aria-hidden {...props}>
      {LOGO_PATHS.map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth={91.5714}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
