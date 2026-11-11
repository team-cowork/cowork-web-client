'use client';

import { type ReactNode } from 'react';

import Image from 'next/image';

import { useQuery } from '@tanstack/react-query';

import { AttachmentCard } from '@/entities/attachment/ui/attachment-card';
import { messageQueries } from '@/entities/message/api/message-queries';
import { type MessageAttachment } from '@/entities/message/model/message';
import { cn } from '@/shared/lib/cn';
import { formatFileSize } from '@/shared/lib/format-file-size';
import { LocalImage } from '@/shared/ui/local-image';

export interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
  /** 저장된 메시지면 넘긴다. 이미지 미리보기를 받을 때 쓴다. */
  source?: { channelId: number; messageId: string };
  /** 첨부 순번으로 파일을 연다. 없으면 카드를 누를 수 없다. */
  onOpen?: (attachmentIndex: number) => void;
  className?: string;
}

function isImage(attachment: MessageAttachment) {
  return attachment.mimeType.startsWith('image/');
}

export function MessageAttachments({
  attachments,
  source,
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
            {source && isImage(attachment) ? (
              <ImagePreview
                channelId={source.channelId}
                messageId={source.messageId}
                attachmentIndex={index}
                attachment={attachment}
                className={cn(onOpen && 'hover:border-outline')}
              />
            ) : isImage(attachment) && attachment.localFile ? (
              <ImageFrame>
                <LocalImage
                  file={attachment.localFile}
                  alt={attachment.name}
                  className={IMAGE_CLASS_NAME}
                />
              </ImageFrame>
            ) : (
              <AttachmentCard
                name={attachment.name}
                meta={formatFileSize(attachment.size)}
                className={cn(onOpen && 'hover:border-outline')}
              />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** 이미지 첨부는 카드 대신 썸네일로 보여주고, URL을 받지 못하면 카드로 돌아간다. */
function ImagePreview({
  channelId,
  messageId,
  attachmentIndex,
  attachment,
  className,
}: {
  channelId: number;
  messageId: string;
  attachmentIndex: number;
  attachment: MessageAttachment;
  className?: string;
}) {
  const { data, isPending, isError } = useQuery(
    messageQueries.attachmentUrl(channelId, messageId, attachmentIndex),
  );

  if (isError) {
    return (
      <AttachmentCard
        name={attachment.name}
        meta={formatFileSize(attachment.size)}
        className={className}
      />
    );
  }

  return (
    <ImageFrame className={className}>
      {!isPending ? (
        // 서명된 일회성 URL이라 이미지 최적화 서버를 거치지 않는다.
        <Image
          src={data.downloadUrl}
          alt={attachment.name}
          width={0}
          height={0}
          sizes="28rem"
          unoptimized
          className={IMAGE_CLASS_NAME}
        />
      ) : attachment.localFile ? (
        // 방금 보낸 이미지는 URL을 받는 동안 원본을 그대로 보여줘 깜빡이지 않게 한다.
        <LocalImage
          file={attachment.localFile}
          alt={attachment.name}
          className={IMAGE_CLASS_NAME}
        />
      ) : (
        <span className="block h-48 w-64 animate-pulse" />
      )}
    </ImageFrame>
  );
}

const IMAGE_CLASS_NAME = 'block h-auto max-h-80 w-auto max-w-full';

function ImageFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'block w-fit overflow-hidden rounded-xl border border-outline-variant bg-surface-container',
        className,
      )}
    >
      {children}
    </span>
  );
}
