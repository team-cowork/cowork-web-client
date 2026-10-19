import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/example')({
  component: ProfileExamplePage,
});

function ProfileExamplePage() {
  return (
    <div className="p-2">
      <h3>Profile Example Page</h3>
    </div>
  );
}
