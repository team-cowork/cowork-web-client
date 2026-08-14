"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { teamQueries } from "@/entities/team/api/team-queries";
import { teamPath } from "@/shared/model/paths";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { UsersIcon } from "@/shared/ui/icons/users-icon";
import { LoadingPane } from "@/shared/ui/loading-pane";

export default function Home() {
  const router = useRouter();
  const { data: teams, isPending, isError, refetch } = useQuery(teamQueries.list());
  const firstTeamId = teams?.[0]?.id;

  useEffect(() => {
    if (firstTeamId != null) router.replace(teamPath(firstTeamId));
  }, [firstTeamId, router]);

  return (
    <div className="bg-background flex flex-1 items-center justify-center p-6">
      {isPending && <LoadingPane label="팀을 불러오는 중…" />}

      {isError && (
        <ErrorState
          title="팀을 불러오지 못했습니다"
          description="잠시 후 다시 시도해 주세요"
          action={
            <Button size="S" variant="weak" onClick={() => refetch()}>
              다시 시도
            </Button>
          }
        />
      )}

      {teams?.length === 0 && (
        <EmptyState
          icon={<UsersIcon />}
          title="참여 중인 팀이 없습니다"
          description="초대 링크로 팀에 가입하거나 새 팀을 만들어 보세요"
          className="max-w-md"
        />
      )}
    </div>
  );
}
