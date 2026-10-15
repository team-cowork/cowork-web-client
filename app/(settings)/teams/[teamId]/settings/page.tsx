import { notFound, redirect } from 'next/navigation';

export default async function TeamSettingsIndexPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  if (!/^\d+$/.test(teamId)) notFound();

  redirect(`/teams/${teamId}/settings/profile`);
}
