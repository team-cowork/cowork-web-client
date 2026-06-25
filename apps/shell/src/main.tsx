import { registerRemotes } from '@module-federation/enhanced/runtime';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';

import { routeTree } from './routeTree.gen';

import './globals.css';

// 배포 환경에서는 nginx 가 env 로 치환한 /config.js 가 window.__MF_REMOTES__ 를 주입한다.
// 그 값으로 빌드타임 remote 등록을 런타임에 덮어써, 재빌드 없이 remote 위치를 바꿀 수 있다.
// dev(config.js 부재)에서는 이 분기가 실행되지 않아 빌드타임 localhost remotes 가 유지된다.
const runtimeRemotes = window.__MF_REMOTES__;
if (runtimeRemotes) {
  registerRemotes(
    Object.entries(runtimeRemotes).map(([name, entry]) => ({ name, entry })),
    { force: true },
  );
}

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
