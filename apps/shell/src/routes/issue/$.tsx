import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/issue/$')({
  component: IssueNestedRoute,
});

function IssueNestedRoute() {
  return null;
}
