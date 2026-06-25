import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginReact } from '@rsbuild/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  html: {
    title: 'cowork',
    meta: {
      description: 'cowork shell application',
      viewport: 'width=device-width, initial-scale=1.0',
    },
    // 런타임 env로 치환되는 /config.js 를 번들보다 먼저 로드해 window.__MF_REMOTES__ 를 주입한다.
    // 프로덕션 빌드에만 주입해 dev 에서는 불필요한 /config.js 요청이 발생하지 않는다.
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
      // 배포 시 window.__MF_REMOTES__(/config.js)로 remote entry URL 을 런타임 교체
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
