"use client";

import { useState } from "react";

import { notFound } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { channelQueries } from "@/entities/channel/api/channel-queries";
import { ChannelHeader } from "@/widgets/channel-header/ui/channel-header";
import { MemberPanel } from "@/widgets/member-panel/ui/member-panel";
import { useRouteIds } from "@/shared/lib/use-route-ids";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { ChatIcon } from "@/shared/ui/icons/chat-icon";
import { LoadingPane } from "@/shared/ui/loading-pane";

export default function ChannelPage() {
  const { channelId } = useRouteIds();

  if (channelId === null) notFound();

  return <ChannelView channelId={channelId} />;
}

function ChannelView({ channelId }: { channelId: number }) {
  const [membersOpen, setMembersOpen] = useState(true);
  const {
    data: channel,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery(channelQueries.detail(channelId));

  if (isError && isAxiosError(error) && error.response?.status === 404) {
    notFound();
  }

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <LoadingPane label="채널을 불러오는 중…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <ErrorState
          title="채널을 불러오지 못했습니다"
          description="잠시 후 다시 시도해 주세요"
          action={
            <Button size="S" variant="weak" onClick={() => refetch()}>
              다시 시도
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1">
      <div className="bg-background flex min-w-0 flex-1 flex-col">
        <ChannelHeader channel={channel} onToggleMembers={() => setMembersOpen((prev) => !prev)} />
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState
            icon={<ChatIcon />}
            title="채팅 기능 준비 중"
            description="메시지 API 연동 후 이 영역에 대화가 표시됩니다"
            className="max-w-md"
          />
        </div>
      </div>

      {membersOpen && <MemberPanel channelId={channelId} />}
    </div>
  );
}
