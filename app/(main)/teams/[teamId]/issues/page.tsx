// TODO(임시): 발표용 임시 칸반 페이지. 서버 연동을 하지 않으면 이 폴더째 지운다.
import { notFound } from 'next/navigation';

import { IssueBoard } from '@/widgets/issue-board/ui/issue-board';

export default async function TeamIssuesPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  if (!/^\d+$/.test(teamId)) notFound();

  return <IssueBoard teamId={Number(teamId)} />;
}
