import { createRouter, RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';

import { routeTree } from './routeTree.gen';

import './globals.css';

// remote URL 의 런타임 주입은 mf-runtime-plugin.ts(beforeRequest)에서 처리한다.
// (main.tsx 에서 registerRemotes 를 호출하면 asyncStartup 소비보다 늦어 적용되지 않음)

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
