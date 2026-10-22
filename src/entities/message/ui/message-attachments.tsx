'use client';

import { AttachmentCard } from '@/entities/attachment/ui/attachment-card';
import { type MessageAttachment } from '@/entities/message/model/message';
import { cn } from '@/shared/lib/cn';
import { formatFileSize } from '@/shared/lib/format-file-size';

export interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
  /** 첨부 순번으로 파일을 연다. 없으면 카드를 누를 수 없다. */
  onOpen?: (attachmentIndex: number) => void;
  className?: string;
}

export function MessageAttachments({
  attachments,
  onOpen,
  className,
}: MessageAttachmentsProps) {
  if (attachments.length === 0) return null;

  return (
    <ul className={cn('flex max-w-md flex-col gap-2', className)}>
      {attachments.map((attachment, index) => (
        <li key={attachment.objectKey ?? `${attachment.name}-${index}`}>
          <button
            type="button"
            aria-label={`${attachment.name} 열기`}
            disabled={!onOpen}
            onClick={(event) => {
              event.stopPropagation();
              onOpen?.(index);
            }}
            className="w-full cursor-pointer text-left disabled:cursor-default"
          >
            <AttachmentCard
              name={attachment.name}
              meta={formatFileSize(attachment.size)}
              className={cn(onOpen && 'hover:border-outline')}
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
