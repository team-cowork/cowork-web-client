import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/chat/$')({
  component: ChatNestedRoute,
});

function ChatNestedRoute() {
  return null;
}
