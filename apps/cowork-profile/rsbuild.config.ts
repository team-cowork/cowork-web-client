import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginReact } from '@rsbuild/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';

const assetPrefix = process.env.ASSET_PREFIX || 'http://127.0.0.1:3003';

export default defineConfig({
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  dev: {
    assetPrefix: 'http://127.0.0.1:3003',
    lazyCompilation: false,
  },
  output: {
    assetPrefix,
  },
  server: {
    host: '127.0.0.1',
    port: 3003,
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    },
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
      name: 'cowork_profile',
      exposes: {
        './App': './src/App.tsx',
      },
      experiments: {
        asyncStartup: true,
      },
      shared: ['react', 'react-dom'],
    }),
  ],
});
