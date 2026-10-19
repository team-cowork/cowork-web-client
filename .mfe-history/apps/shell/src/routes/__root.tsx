import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet, redirect, useRouterState } from '@tanstack/react-router';

import { isAuthenticated } from '../features/auth/lib/guard';
import { AppLayout } from '../widgets/app-layout';

export interface RouterContext {
  queryClient: QueryClient;
}

const PUBLIC_ROUTES = ['/signin', '/auth/callback', '/auth/error'];

const RootLayout = () => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  return isPublicRoute ? <Outlet /> : <AppLayout />;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location }) => {
    if (PUBLIC_ROUTES.includes(location.pathname)) return;

    const authenticated = await isAuthenticated();
    if (!authenticated) {
      throw redirect({ to: '/signin' });
    }
  },
  component: RootLayout,
});
