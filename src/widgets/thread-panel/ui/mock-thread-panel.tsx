'use client';

import { type Message } from '@/entities/message/model/message';
import { useMockReplyThread } from '@/entities/message/model/use-mock-reply-thread';
import { ThreadPanel } from '@/widgets/thread-panel/ui/thread-panel';

export interface MockThreadPanelProps {
  subtitle: string;
  rootMessage: Message;
  onClose: () => void;
  className?: string;
}

/**
 * 목 답글을 물린 스레드 패널. 메시지 API가 연동되면 이 컴포넌트를 걷어내고
 * 각 화면에서 실제 쿼리를 ThreadPanel에 직접 주입한다.
 */
export function MockThreadPanel({
  subtitle,
  rootMessage,
  onClose,
  className,
}: MockThreadPanelProps) {
  const { replies, sendReply } = useMockReplyThread(rootMessage);

  return (
    <ThreadPanel
      subtitle={subtitle}
      rootMessage={rootMessage}
      replies={replies}
      onSendReply={sendReply}
      onClose={onClose}
      className={className}
    />
  );
}
