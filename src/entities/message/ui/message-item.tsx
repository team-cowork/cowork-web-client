import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { Avatar, type AvatarTone } from '@/shared/ui/avatar';

export interface MessageItemProps {
  author: string;
  timestamp: string;
  content: ReactNode;
  avatarSrc?: string;
  tone?: AvatarTone;
  /** 작성자·시각 줄 위에 붙는 답글 원본 인용 */
  quote?: ReactNode;
  /** 시각 뒤에 붙는 보조 표시(예: 수정됨) */
  meta?: ReactNode;
  /** 본문 아래 상태 표시(예: 전송 실패) */
  footer?: ReactNode;
  /** 전송 중처럼 아직 확정되지 않은 메시지를 흐리게 표시 */
  dimmed?: boolean;
  className?: string;
}

export function MessageItem({
  author,
  timestamp,
  content,
  avatarSrc,
  tone,
  quote,
  meta,
  footer,
  dimmed = false,
  className,
}: MessageItemProps) {
  return (
    <div className={cn('flex items-start px-4 py-1', className)}>
      <Avatar
        src={avatarSrc}
        name={author}
        size={44}
        shape="circle"
        tone={tone}
        className="shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-5">
        {quote}
        <p className="typography-label-x-small text-on-surface-variant">
          {author && <>{author} · </>}
          {timestamp}
          {meta && <> {meta}</>}
        </p>
        <div
          className={cn(
            'typography-subtext-large break-words text-on-surface',
            dimmed && 'opacity-60',
          )}
        >
          {content}
        </div>
        {footer}
      </div>
    </div>
  );
}
