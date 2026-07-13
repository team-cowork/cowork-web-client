import { lazy, Suspense } from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { useWorkspace } from '../shared/workspace';

const ChatApp = lazy(() => import('cowork_chat/App'));

export const Route = createFileRoute('/chat')({
  component: ChatRoute,
});

function ChatRoute() {
  const { activeChannel } = useWorkspace();

  return (
    <Suspense fallback={<div className="text-on-surface-variant p-6">Loading Chat...</div>}>
      <ChatApp
        basepath="/chat"
        channel={
          activeChannel && {
            id: activeChannel.id,
            name: activeChannel.name,
            description: activeChannel.description,
          }
        }
      />
    </Suspense>
  );
}
