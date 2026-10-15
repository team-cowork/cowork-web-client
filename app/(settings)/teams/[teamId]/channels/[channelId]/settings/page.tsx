import { notFound, redirect } from 'next/navigation';

export default async function ChannelSettingsIndexPage({
  params,
}: {
  params: Promise<{ teamId: string; channelId: string }>;
}) {
  const { teamId, channelId } = await params;

  if (!/^\d+$/.test(teamId) || !/^\d+$/.test(channelId)) notFound();

  redirect(`/teams/${teamId}/channels/${channelId}/settings/overview`);
}
