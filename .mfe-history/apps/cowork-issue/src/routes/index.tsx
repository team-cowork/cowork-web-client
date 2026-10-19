import { createFileRoute } from '@tanstack/react-router';

import { IssueView } from '../views/issue-view';

export const Route = createFileRoute('/')({
  component: IssueView,
});
