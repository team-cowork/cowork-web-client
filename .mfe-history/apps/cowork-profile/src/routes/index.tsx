import { createFileRoute } from '@tanstack/react-router';

import { ProfileView } from '../views/profile-view';

export const Route = createFileRoute('/')({
  component: ProfileView,
});
