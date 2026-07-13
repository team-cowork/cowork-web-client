import { createRootRoute, Outlet, redirect, useRouterState } from '@tanstack/react-router';

import { ensureAuthenticated } from '../features/auth/guard';
import { AppLayout } from '../widgets/app-layout';

const PUBLIC_ROUTES = ['/login', '/auth/callback', '/auth/error'];

const RootLayout = () => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  return isPublicRoute ? <Outlet /> : <AppLayout />;
};

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (PUBLIC_ROUTES.includes(location.pathname)) return;

    const authenticated = await ensureAuthenticated();
    if (!authenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: RootLayout,
});
