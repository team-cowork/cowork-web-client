import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/example')({
  component: IssueExamplePage,
});

function IssueExamplePage() {
  return (
    <div className="p-2">
      <h3>Issue Example Page</h3>
    </div>
  );
}
