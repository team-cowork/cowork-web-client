import { useState } from 'react';

import { createRouter, RouterProvider } from '@tanstack/react-router';

import { type ActiveChannel, ChannelProvider } from './shared/channel-context';

import { routeTree } from './routeTree.gen';

import './globals.css';

const createAppRouter = (basepath: string) => createRouter({ routeTree, basepath });

type AppRouter = ReturnType<typeof createAppRouter>;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}

interface AppProps {
  basepath?: string;
  channel?: ActiveChannel;
}

export default function App({ basepath = '/', channel }: AppProps) {
  const [router] = useState(() => createAppRouter(basepath));

  return (
    <ChannelProvider value={channel}>
      <RouterProvider router={router} />
    </ChannelProvider>
  );
}
