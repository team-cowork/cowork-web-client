import { toAuthorTone } from '@/entities/message/lib/author-tone';
import {
  formatMessageClock,
  formatMessageTime,
} from '@/entities/message/lib/format-message-time';
import { type Message } from '@/entities/message/model/message';
import { MessageItem } from '@/entities/message/ui/message-item';
import { Markdown } from '@/shared/ui/markdown';

export type MessageTimestampFormat = 'day' | 'clock';

export interface MessageViewProps {
  message: Message;
  timestampFormat?: MessageTimestampFormat;
  className?: string;
}

/**
 * Message 한 건을 화면에 그리는 표준 표현.
 * 메시지 목록·스레드 등 대화가 노출되는 모든 곳에서 이 컴포넌트를 쓴다.
 */
export function MessageView({
  message,
  timestampFormat = 'day',
  className,
}: MessageViewProps) {
  const timestamp =
    timestampFormat === 'clock'
      ? formatMessageClock(message.createdAt)
      : formatMessageTime(message.createdAt);

  return (
    <MessageItem
      author={message.authorName}
      timestamp={timestamp}
      content={<Markdown>{message.content}</Markdown>}
      avatarSrc={message.authorImageUrl ?? undefined}
      tone={toAuthorTone(message.authorName)}
      className={className}
    />
  );
}
