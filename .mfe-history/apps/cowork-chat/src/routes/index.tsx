import { createFileRoute } from '@tanstack/react-router';

import { ChatView } from '../views/chat-view';

export const Route = createFileRoute('/')({
  component: ChatView,
});
