import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/profile/$')({
  component: ProfileNestedRoute,
});

function ProfileNestedRoute() {
  return null;
}
