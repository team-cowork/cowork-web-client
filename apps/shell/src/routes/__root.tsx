import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';

import { AppLayout } from '../widgets/app-layout';

const PUBLIC_ROUTES = ['/login', '/auth/callback', '/auth/error'];

const RootLayout = () => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  return isPublicRoute ? <Outlet /> : <AppLayout />;
};

export const Route = createRootRoute({ component: RootLayout });
