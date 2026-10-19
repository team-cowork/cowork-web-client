import { lazy, Suspense } from 'react';

import { createFileRoute } from '@tanstack/react-router';

const IssueApp = lazy(() => import('cowork_issue/App'));

export const Route = createFileRoute('/issue')({
  component: IssueRoute,
});

function IssueRoute() {
  return (
    <Suspense fallback={<div>Loading Issue...</div>}>
      <IssueApp basepath="/issue" />
    </Suspense>
  );
}
