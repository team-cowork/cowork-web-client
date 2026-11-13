import { readdirSync } from 'node:fs';

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// FSD 레이어 규칙: 아래 레이어는 위 레이어를 import하지 않고, 같은 레이어의 다른 slice도 import하지 않는다.
// 여러 slice가 함께 필요하면 한 단계 위 레이어에서 조합한다.
// 스타일시트 side-effect import(`./globals.css`)는 Next.js 관례라 허용한다.
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

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const otherSlice = (layer, slice) => ({
  regex: `^@/${layer}/(?!${escapeRegExp(slice)}/)`,
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
  // app 안에서는 라우트 옆에 둔 비공개 폴더(`./_ui` 등)만 상대 경로로 import할 수 있다.
  restrict(['app/**/*.{ts,tsx}', 'proxy.ts'], 'error', [
    { ...RELATIVE_IMPORT, regex: '^(?!\\./_)\\.\\.?/(?!.*\\.css$)' },
  ]),
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
  ...slicesOf('widgets').map((slice) =>
    restrict([`src/widgets/${slice}/**/*.{ts,tsx}`], 'error', [
      RELATIVE_IMPORT,
      otherSlice('widgets', slice),
    ]),
  ),
]);

export default eslintConfig;
