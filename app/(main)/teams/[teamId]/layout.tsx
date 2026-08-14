import { type ReactNode } from "react";

import { notFound } from "next/navigation";

export default async function TeamLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  if (!/^\d+$/.test(teamId)) notFound();

  return children;
}
