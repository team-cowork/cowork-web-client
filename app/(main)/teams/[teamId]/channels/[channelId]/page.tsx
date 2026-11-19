'use client';

import { useEffect, useState } from 'react';

import { notFound } from 'next/navigation';

import { useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';

import { isHttpStatus } from '@/shared/api/http-error';
import { channelQueries } from '@/entities/channel/api/channel-queries';
import { useLastChannelStore } from '@/entities/channel/model/last-channel-store';
import { LiveStatusBadge } from '@/entities/live/ui/live-status-badge';
import { type Message } from '@/entities/message/model/message';
import { VoiceParticipantBadge } from '@/features/voice-session/ui/voice-participant-badge';
import { ChannelHeader } from '@/widgets/channel-header/ui/channel-header';
import { ChannelChatPanel } from '@/widgets/chat-panel/ui/channel-chat-panel';
import { FileSharePanel } from '@/widgets/file-share/ui/file-share-panel';
import { MeetingNotePanel } from '@/widgets/meeting-note/ui/meeting-note-panel';
import { MemberPanel } from '@/widgets/member-panel/ui/member-panel';
import { MessageSearchPanel } from '@/widgets/message-search/ui/message-search-panel';
import { MessageList } from '@/widgets/message-list/ui/message-list';
import { PinnedMessagesPanel } from '@/widgets/message-list/ui/pinned-messages-panel';
import { ChannelThreadPanel } from '@/widgets/message-list/ui/channel-thread-panel';
import { VoiceActivityPanel } from '@/widgets/voice-activity/ui/voice-activity-panel';
import { VoiceLogReader } from '@/widgets/voice-activity/ui/voice-log-reader';
import { VoiceStage } from '@/widgets/voice-stage/ui/voice-stage';
import { useRouteIds } from '@/shared/lib/use-route-ids';
import { Button } from '@/shared/ui/button';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingPane } from '@/shared/ui/loading-pane';
import { QueryBoundary } from '@/shared/ui/query-boundary';

function ChannelPageError({ error, resetErrorBoundary }: FallbackProps) {
  if (isHttpStatus(error, 404)) notFound();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        title="채널을 불러오지 못했습니다"
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

export default function ChannelPage() {
  const { teamId, channelId } = useRouteIds();

  if (teamId === null || channelId === null) notFound();

  return (
    <QueryBoundary
      loadingFallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <LoadingPane label="채널을 불러오는 중…" />
        </div>
      }
      errorFallback={ChannelPageError}
      resetKeys={[teamId, channelId]}
      onError={(error) => {
        if (isHttpStatus(error, 404)) {
          useLastChannelStore.getState().clearLastChannelId(teamId, channelId);
        }
      }}
    >
      <ChannelView key={channelId} teamId={teamId} channelId={channelId} />
    </QueryBoundary>
  );
}

type SidePanel = 'members' | 'pins' | 'search' | 'activity';

function ChannelView({
  teamId,
  channelId,
}: {
  teamId: number;
  channelId: number;
}) {
  const { data: channel } = useSuspenseQuery(channelQueries.detail(channelId));
  const isMeetingNote = channel.viewType === 'MEETING_NOTE';
  const isVoice = channel.type === 'VOICE';
  // 회의록은 본문 폭이 넓어야 읽고 쓰기 편해서 멤버 패널을 닫은 채 시작한다.
  // 음성 채널은 입장·퇴장 기록을 바로 보여 주어 쌓인 미읽음을 읽음 처리한다.
  const [sidePanel, setSidePanel] = useState<SidePanel | null>(
    isMeetingNote ? null : isVoice ? 'activity' : 'members',
  );
  const [threadRoot, setThreadRoot] = useState<Message | null>(null);

  const setLastChannelId = useLastChannelStore(
    (state) => state.setLastChannelId,
  );

  useEffect(() => {
    if (channel.teamId === teamId) setLastChannelId(teamId, channelId);
  }, [channel.teamId, teamId, channelId, setLastChannelId]);

  if (channel.teamId !== teamId) {
    notFound();
  }

  // 고정 메시지와 메시지 검색은 채팅이 있는 채널에서만 연다.
  const hasMessages = !isVoice && !isMeetingNote;

  // 스레드가 열려 있으면 오른쪽 패널 자리를 스레드가 쓴다. 다른 패널을 열면 스레드는 닫는다.
  const toggleSidePanel = (panel: SidePanel) => {
    setThreadRoot(null);
    setSidePanel((prev) => (prev === panel && !threadRoot ? null : panel));
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <ChannelHeader
          teamId={teamId}
          channel={channel}
          meta={
            isVoice ? (
              <>
                <VoiceParticipantBadge channelId={channelId} />
                <LiveStatusBadge channelId={channelId} />
              </>
            ) : undefined
          }
          onToggleMembers={() => toggleSidePanel('members')}
          onTogglePins={hasMessages ? () => toggleSidePanel('pins') : undefined}
          onToggleSearch={
            hasMessages ? () => toggleSidePanel('search') : undefined
          }
          onToggleActivity={
            isVoice ? () => toggleSidePanel('activity') : undefined
          }
        />

        {isVoice && <VoiceLogReader channelId={channelId} />}
        {isVoice ? (
          <VoiceStage channelId={channelId} />
        ) : channel.viewType === 'FILE_SHARE' ? (
          <FileSharePanel channelId={channelId} />
        ) : isMeetingNote ? (
          <MeetingNotePanel teamId={teamId} channelId={channelId} />
        ) : (
          <ChannelChatPanel
            renderMessageList={(props) => <MessageList {...props} />}
            channelId={channelId}
            projectId={channel.projectId}
            placeholder={`#${channel.name}에 메시지 보내기`}
            onSelectMessage={setThreadRoot}
          />
        )}
      </div>

      {threadRoot ? (
        <ChannelThreadPanel
          key={threadRoot._id}
          channelId={channelId}
          subtitle={`# ${channel.name}`}
          rootMessage={threadRoot}
          onClose={() => setThreadRoot(null)}
        />
      ) : sidePanel === 'search' && hasMessages ? (
        <MessageSearchPanel
          teamId={teamId}
          channelId={channelId}
          projectId={channel.projectId}
          onClose={() => setSidePanel(null)}
        />
      ) : sidePanel === 'pins' && hasMessages ? (
        <PinnedMessagesPanel
          channelId={channelId}
          subtitle={`# ${channel.name}`}
          onClose={() => setSidePanel(null)}
        />
      ) : sidePanel === 'activity' && isVoice ? (
        <VoiceActivityPanel
          channelId={channelId}
          subtitle={channel.name}
          onClose={() => setSidePanel(null)}
        />
      ) : (
        sidePanel === 'members' && <MemberPanel channelId={channelId} />
      )}
    </div>
  );
}
