import { lazy, Suspense } from 'react';

import { createFileRoute } from '@tanstack/react-router';

const ProfileApp = lazy(() => import('cowork_profile/App'));

export const Route = createFileRoute('/profile')({
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <Suspense fallback={<div>Loading Profile...</div>}>
      <ProfileApp basepath="/profile" />
    </Suspense>
  );
}
