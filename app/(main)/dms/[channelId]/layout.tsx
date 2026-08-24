import { type ReactNode } from 'react';

import { notFound } from 'next/navigation';

export default async function DmLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;

  if (!/^\d+$/.test(channelId)) notFound();

  return children;
}
