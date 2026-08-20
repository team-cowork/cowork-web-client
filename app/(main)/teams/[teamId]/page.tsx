"use client";

import { notFound } from "next/navigation";

import { useSuspenseQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { type FallbackProps } from "react-error-boundary";

import { teamQueries } from "@/entities/team/api/team-queries";
import { useRouteIds } from "@/shared/lib/use-route-ids";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { ChatIcon } from "@/shared/ui/icons/chat-icon";
import { LoadingPane } from "@/shared/ui/loading-pane";
import { QueryBoundary } from "@/shared/ui/query-boundary";

function TeamPageError({ error, resetErrorBoundary }: FallbackProps) {
  if (isAxiosError(error) && error.response?.status === 404) notFound();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="팀을 불러오지 못했습니다"
        description="잠시 후 다시 시도해 주세요"
        action={
          <Button size="S" variant="weak" onClick={resetErrorBoundary}>
            다시 시도
          </Button>
        }
      />
    </div>
  );
}

export default function TeamPage() {
  const { teamId } = useRouteIds();

  if (teamId === null) notFound();

  return (
    <QueryBoundary
      loadingFallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <LoadingPane label="팀을 불러오는 중…" />
        </div>
      }
      errorFallback={TeamPageError}
    >
      <TeamView teamId={teamId} />
    </QueryBoundary>
  );
}

function TeamView({ teamId }: { teamId: number }) {
  useSuspenseQuery(teamQueries.detail(teamId));

  return (
    <div className="bg-background flex flex-1 items-center justify-center p-6">
      <EmptyState
        icon={<ChatIcon />}
        title="채널을 선택하세요"
        description="왼쪽 목록에서 채널을 골라 대화를 확인할 수 있습니다"
        className="max-w-md"
      />
    </div>
  );
}
