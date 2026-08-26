'use client';

import { useMockMessageThread } from '@/entities/message/model/use-mock-message-thread';
import { ChatPanel } from '@/widgets/chat-panel/ui/chat-panel';

export interface MockChatPanelProps {
  channelId: number;
  className?: string;
}

/**
 * 목 스레드를 물린 채팅 본문. 메시지 API가 연동되면 이 컴포넌트를 걷어내고
 * 각 화면에서 실제 쿼리를 ChatPanel에 직접 주입한다.
 */
export function MockChatPanel({ channelId, className }: MockChatPanelProps) {
  const { messages, sendMessage } = useMockMessageThread(channelId);

  return (
    <ChatPanel
      messages={messages}
      onSendMessage={sendMessage}
      className={className}
    />
  );
}
