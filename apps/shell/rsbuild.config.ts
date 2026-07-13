import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginReact } from '@rsbuild/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';

// .env.local(gitignore)에 PUBLIC_DATAGSM_CLIENT_ID / PUBLIC_AUTH_API_BASE_URL을 넣으면
// 로컬 DataGSM PKCE 연동 값을 코드 수정 없이 오버라이드할 수 있다.
const { publicVars } = loadEnv();

const AUTH_CONFIG_DEFAULTS = {
  'import.meta.env.PUBLIC_DATAGSM_CLIENT_ID': JSON.stringify('cowork-shell-dev'),
  'import.meta.env.PUBLIC_AUTH_API_BASE_URL': JSON.stringify('https://ssh.gsmsv.site:22132/api'),
};

export default defineConfig({
  source: {
    entry: {
      index: './src/main.tsx',
    },
    define: { ...AUTH_CONFIG_DEFAULTS, ...publicVars },
  },
  html: {
    title: 'cowork',
    meta: {
      description: 'cowork shell application',
      viewport: 'width=device-width, initial-scale=1.0',
    },
    tags:
      process.env.NODE_ENV === 'production'
        ? [{ tag: 'script', attrs: { src: '/config.js' }, head: true, append: false }]
        : [],
  },
  dev: {
    assetPrefix: true,
    lazyCompilation: false,
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
  tools: {
    rspack: {
      plugins: [
        tanstackRouter({
          target: 'react',
          autoCodeSplitting: true,
        }),
      ],
    },
  },
  plugins: [
    pluginReact(),
    pluginBabel({
      include: /\.[jt]sx?$/,
      exclude: [/[\\/]node_modules[\\/]/],
      babelLoaderOptions(opts) {
        opts.plugins?.unshift('babel-plugin-react-compiler');
      },
    }),
    pluginModuleFederation({
      name: 'shell',
      remotes: {
        cowork_chat: 'cowork_chat@http://127.0.0.1:3001/mf-manifest.json',
        cowork_issue: 'cowork_issue@http://127.0.0.1:3002/mf-manifest.json',
        cowork_profile: 'cowork_profile@http://127.0.0.1:3003/mf-manifest.json',
      },
      runtimePlugins: ['./src/mf-runtime-plugin.ts'],
      experiments: {
        asyncStartup: true,
      },
      dts: {
        consumeTypes: false,
      },
      shared: ['react', 'react-dom'],
    }),
  ],
});
