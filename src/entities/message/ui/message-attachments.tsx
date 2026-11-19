'use client';

import { type ReactNode, useState } from 'react';

import Image from 'next/image';

import { useQuery } from '@tanstack/react-query';

import { AttachmentCard } from '@/entities/attachment/ui/attachment-card';
import { messageQueries } from '@/entities/message/api/message-queries';
import { type MessageAttachment } from '@/entities/message/model/message';
import { cn } from '@/shared/lib/cn';
import { getPreviewImageType } from '@/shared/lib/file-kind';
import { formatFileSize } from '@/shared/lib/format-file-size';
import { LocalImage } from '@/shared/ui/local-image';

type AttachmentSource = { channelId: number; messageId: string };

export interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
  /** 저장된 메시지면 넘긴다. 이미지 미리보기를 받을 때 쓴다. */
  source?: AttachmentSource;
  /** 첨부 순번으로 파일을 연다. 없으면 카드를 누를 수 없다. */
  onOpen?: (attachmentIndex: number) => void;
  /**
   * 드러낸 스포일러 첨부 순번. 뷰어와 함께 쓰도록 메시지 행이 들고 있다.
   * 행이 새로 그려지면 다시 가려지는데, 스포일러는 다시 가려지는 쪽이 안전해서 그대로 둔다.
   */
  revealed?: ReadonlySet<number>;
  onReveal?: (attachmentIndex: number) => void;
  className?: string;
}

/** 아직 드러내지 않은 스포일러 이미지인지. 이미지가 아닌 첨부는 가리지 않는다. */
export function isCoveredSpoiler(
  attachment: Pick<MessageAttachment, 'name' | 'spoiler'>,
  revealed: boolean,
): boolean {
  return (
    Boolean(attachment.spoiler) &&
    Boolean(getPreviewImageType(attachment.name)) &&
    !revealed
  );
}

export function MessageAttachments({
  attachments,
  source,
  onOpen,
  revealed: revealedProp,
  onReveal,
  className,
}: MessageAttachmentsProps) {
  // 위에서 상태를 넘기지 않으면 이 목록 안에서만 기억한다.
  const [localRevealed, setLocalRevealed] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const revealed = revealedProp ?? localRevealed;
  const reveal =
    onReveal ??
    ((index: number) => setLocalRevealed((prev) => new Set(prev).add(index)));

  if (attachments.length === 0) return null;

  return (
    <ul className={cn('flex max-w-md flex-col gap-2', className)}>
      {attachments.map((attachment, index) => (
        <li key={attachment.objectKey ?? `${attachment.name}-${index}`}>
          <AttachmentItem
            attachment={attachment}
            attachmentIndex={index}
            source={source}
            covered={isCoveredSpoiler(attachment, revealed.has(index))}
            onReveal={() => reveal(index)}
            onOpen={onOpen && (() => onOpen(index))}
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * 첨부 하나. 스포일러 이미지는 가린 채 보여 주고, 처음 누르면 드러낸 뒤 그다음부터 연다.
 * 아직 저장되지 않은 내 메시지처럼 열 수 없는 첨부도 눌러서 드러낼 수는 있다.
 */
function AttachmentItem({
  attachment,
  attachmentIndex,
  source,
  covered,
  onReveal,
  onOpen,
}: {
  attachment: MessageAttachment;
  attachmentIndex: number;
  source?: AttachmentSource;
  covered: boolean;
  onReveal: () => void;
  onOpen?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={
        covered
          ? `스포일러 이미지 ${attachment.name} 보기`
          : `${attachment.name} 열기`
      }
      disabled={!covered && !onOpen}
      onClick={(event) => {
        event.stopPropagation();
        if (covered) {
          onReveal();
          return;
        }
        onOpen?.();
      }}
      className="w-full cursor-pointer text-left disabled:cursor-default"
    >
      <AttachmentPreview
        attachment={attachment}
        attachmentIndex={attachmentIndex}
        source={source}
        covered={covered}
        className={cn(onOpen && 'hover:border-outline')}
      />
    </button>
  );
}

/**
 * 이미지 확장자인 첨부는 썸네일로, 나머지는 카드로 보여준다.
 * 확장자와 달리 이미지로 그릴 수 없는 파일이면 카드로 돌아간다.
 */
function AttachmentPreview({
  attachment,
  attachmentIndex,
  source,
  covered = false,
  className,
}: {
  attachment: MessageAttachment;
  attachmentIndex: number;
  source?: AttachmentSource;
  /** 스포일러로 가린 상태 */
  covered?: boolean;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  const card = (
    <AttachmentCard
      name={attachment.name}
      meta={formatFileSize(attachment.size)}
      className={className}
    />
  );

  if (broken || !getPreviewImageType(attachment.name)) return card;

  if (source) {
    return (
      <ImagePreview
        source={source}
        attachmentIndex={attachmentIndex}
        attachment={attachment}
        fallback={card}
        onError={() => setBroken(true)}
        covered={covered}
        className={className}
      />
    );
  }

  if (!attachment.localFile) return card;

  return (
    <ImageFrame covered={covered} className={className}>
      <LocalImage
        file={attachment.localFile}
        alt={attachment.name}
        className={IMAGE_CLASS_NAME}
        onError={() => setBroken(true)}
      />
    </ImageFrame>
  );
}

/** 저장된 이미지 첨부의 썸네일. URL을 받지 못하면 `fallback`을 보여준다. */
function ImagePreview({
  source,
  attachmentIndex,
  attachment,
  fallback,
  onError,
  covered = false,
  className,
}: {
  source: AttachmentSource;
  attachmentIndex: number;
  attachment: MessageAttachment;
  fallback: ReactNode;
  onError: () => void;
  covered?: boolean;
  className?: string;
}) {
  const { data, isPending, isError } = useQuery(
    messageQueries.attachmentUrl(
      source.channelId,
      source.messageId,
      attachmentIndex,
    ),
  );

  if (isError) return fallback;

  return (
    <ImageFrame covered={covered} className={className}>
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
          onError={onError}
        />
      ) : attachment.localFile ? (
        // 방금 보낸 이미지는 URL을 받는 동안 원본을 그대로 보여줘 깜빡이지 않게 한다.
        <LocalImage
          file={attachment.localFile}
          alt={attachment.name}
          className={IMAGE_CLASS_NAME}
          onError={onError}
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
  covered = false,
  className,
}: {
  children: ReactNode;
  /** 스포일러로 가린 상태. 흐리게 덮고 "스포일러" 표시를 얹는다. */
  covered?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'relative block w-fit overflow-hidden rounded-xl border border-outline-variant bg-surface-container',
        className,
      )}
    >
      <span
        aria-hidden={covered}
        className={cn(
          'block transition-[filter]',
          covered && 'scale-105 blur-2xl brightness-75',
        )}
      >
        {children}
      </span>
      {covered && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-black/70 px-3 py-1 typography-label-small text-white">
            스포일러
          </span>
        </span>
      )}
    </span>
  );
}
