import { createRouter, RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';

import { routeTree } from './routeTree.gen';

import './globals.css';

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
