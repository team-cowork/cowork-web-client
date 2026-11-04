import { readdirSync } from 'node:fs';

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// FSD 레이어 규칙: 아래 레이어는 위 레이어를 import하지 않고, 같은 레이어의 다른 slice도 import하지 않습니다.
// 여러 slice가 함께 필요하면 한 단계 위 레이어에서 조합합니다.
// 스타일시트 side-effect import(`./globals.css`)는 Next.js 관례라 허용합니다.
const RELATIVE_IMPORT = {
  regex: '^\\.\\.?/(?!.*\\.css$)',
  message: "상대 경로 대신 '@/' 별칭을 사용해 주세요.",
};

const slicesOf = (layer) =>
  readdirSync(new URL(`./src/${layer}`, import.meta.url), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

const restrict = (files, severity, patterns) => ({
  files,
  rules: { 'no-restricted-imports': [severity, { patterns }] },
});

const otherSlice = (layer, slice) => ({
  regex: `^@/${layer}/(?!${slice}/)`,
  message: `다른 ${layer} slice는 import할 수 없어요. 상위 레이어에서 조합해 주세요.`,
});

const featureRules = (slice) => [
  RELATIVE_IMPORT,
  {
    regex: '^@/widgets/',
    message: 'features는 widgets를 import할 수 없어요.',
  },
  otherSlice('features', slice),
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  restrict(['app/**/*.{ts,tsx}', 'proxy.ts'], 'error', [RELATIVE_IMPORT]),
  restrict(['src/shared/**/*.{ts,tsx}'], 'error', [
    RELATIVE_IMPORT,
    {
      regex: '^@/(entities|features|widgets)/',
      message: 'shared는 상위 레이어를 import할 수 없어요.',
    },
  ]),
  restrict(['src/entities/**/*.{ts,tsx}'], 'error', [
    RELATIVE_IMPORT,
    {
      regex: '^@/(features|widgets)/',
      message: 'entities는 features·widgets를 import할 수 없어요.',
    },
  ]),
  ...slicesOf('features').map((slice) =>
    restrict(
      [`src/features/${slice}/**/*.{ts,tsx}`],
      'error',
      featureRules(slice),
    ),
  ),
  // 열린 PR(#52)이 수정 중인 파일이라 이번에는 경고로 둡니다.
  // FileUploadProgress를 shared/ui로 옮기면 이 예외를 지워 주세요.
  restrict(
    ['src/features/message-attachment/ui/attachment-drafts.tsx'],
    'warn',
    featureRules('message-attachment'),
  ),
  // 기존 위젯 간 import가 남아 있어 경고로 시작합니다. 정리되면 error로 올립니다.
  ...slicesOf('widgets').map((slice) =>
    restrict([`src/widgets/${slice}/**/*.{ts,tsx}`], 'warn', [
      RELATIVE_IMPORT,
      otherSlice('widgets', slice),
    ]),
  ),
]);

export default eslintConfig;
