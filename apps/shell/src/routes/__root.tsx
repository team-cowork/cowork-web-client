import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const PUBLIC_ROUTES = ['/login', '/auth/callback', '/auth/error'];

const RootLayout = () => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  return (
    <>
      {!isPublicRoute && (
        <>
          <div className="flex gap-4 p-2">
            <Link to="/" className="[&.active]:font-bold">
              Home
            </Link>
            <Link to="/chat" className="[&.active]:font-bold">
              Chat
            </Link>
            <Link to="/profile" className="[&.active]:font-bold">
              Profile
            </Link>
            <Link to="/issue" className="[&.active]:font-bold">
              Issue
            </Link>
          </div>
          <hr />
        </>
      )}
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
