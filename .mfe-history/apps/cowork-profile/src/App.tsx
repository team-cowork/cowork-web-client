import { useState } from 'react';

import { createRouter, RouterProvider } from '@tanstack/react-router';

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
}

export default function App({ basepath = '/' }: AppProps) {
  const [router] = useState(() => createAppRouter(basepath));

  return <RouterProvider router={router} />;
}
