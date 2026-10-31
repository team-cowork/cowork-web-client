'use client';

import { type MentionedMessage } from '@/entities/message/model/message';
import { useMessageAuthor } from '@/entities/message/model/use-message-author';
import { cn } from '@/shared/lib/cn';

export interface MessageQuoteProps {
  /** 원본이 삭제됐거나 아직 모르면 비어 있다 */
  mentioned: MentionedMessage | null | undefined;
  className?: string;
}

const QUOTE_CLASS =
  'flex min-w-0 items-center gap-1.5 border-l-2 border-outline-variant pl-2 typography-subtext-medium text-on-surface-variant';

/** 답글이 가리키는 원본 메시지를 한 줄로 보여준다. */
export function MessageQuote({ mentioned, className }: MessageQuoteProps) {
  if (!mentioned) {
    return (
      <p className={cn(QUOTE_CLASS, 'italic', className)}>
        원본 메시지를 찾을 수 없어요
      </p>
    );
  }

  return <MentionedQuote mentioned={mentioned} className={className} />;
}

function MentionedQuote({
  mentioned,
  className,
}: {
  mentioned: MentionedMessage;
  className?: string;
}) {
  const author = useMessageAuthor(mentioned.authorId);

  return (
    <p className={cn(QUOTE_CLASS, className)}>
      {author.name && (
        <span className="shrink-0 typography-label-x-small text-on-surface">
          {author.name}
        </span>
      )}
      <span className="truncate">{mentioned.content}</span>
    </p>
  );
}
