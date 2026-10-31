'use client';

import { type ReactNode } from 'react';

import { type AttachmentUpload } from '@/features/message-attachment/model/use-attachment-uploads';
import { cn } from '@/shared/lib/cn';
import { formatFileSize } from '@/shared/lib/format-file-size';
import { Badge } from '@/shared/ui/badge';
import { CloseIcon } from '@/shared/ui/icons/close-icon';
import { FileIcon } from '@/shared/ui/icons/file-icon';
import { LocalImage } from '@/shared/ui/local-image';

export interface AttachmentDraftsProps {
  uploads: AttachmentUpload[];
  onRemove: (id: string) => void;
  /** 첨부 목록 위에 보여줄 안내(예: 업로드가 끝나야 보낼 수 있음) */
  hint?: ReactNode;
  className?: string;
}

/**
 * 전송 전에 붙여 둔 파일.
 * 메시지에 올라간 첨부 카드와 헷갈리지 않도록 점선 테두리와 상태 표시로 구분한다.
 */
export function AttachmentDrafts({
  uploads,
  onRemove,
  hint,
  className,
}: AttachmentDraftsProps) {
  if (uploads.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {hint && (
        <p
          role="status"
          className="px-1 typography-subtext-medium text-on-surface-variant"
        >
          {hint}
        </p>
      )}
      <ul className="flex flex-wrap gap-2">
        {uploads.map((upload) => (
          <li key={upload.id} className="w-64">
            <AttachmentDraft
              upload={upload}
              onRemove={() => onRemove(upload.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function AttachmentDraft({
  upload,
  onRemove,
}: {
  upload: AttachmentUpload;
  onRemove: () => void;
}) {
  const { file, status } = upload;
  const progress = Math.max(0, Math.min(100, Math.round(upload.progress)));

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[16px] border border-dashed bg-surface-container-low p-3',
        status === 'failed' ? 'border-error' : 'border-outline',
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-tertiary-container text-on-tertiary-container [&_svg]:size-6">
        {file.type.startsWith('image/') ? (
          <LocalImage file={file} alt="" className="size-full object-cover" />
        ) : (
          <FileIcon />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate typography-label-small text-on-surface">
          {file.name}
        </p>
        {status === 'uploading' && (
          <>
            <p className="typography-subtext-medium text-on-surface-variant">
              업로드 중 {progress}%
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-variant">
              <div
                role="progressbar"
                aria-label={`${file.name} 업로드 진행률`}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}
        {status === 'done' && (
          <p className="flex items-center gap-1.5 typography-subtext-medium text-on-surface-variant">
            <Badge color="brand">전송 대기</Badge>
            {formatFileSize(file.size)}
          </p>
        )}
        {status === 'failed' && (
          <p className="typography-subtext-medium text-error">
            업로드 실패 · 보내지 않아요
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${file.name} 첨부 삭제`}
        className="shrink-0 cursor-pointer rounded-md p-1 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
}
