'use client';

import { useState } from 'react';

import { type AttachmentUpload } from '@/features/message-attachment/model/use-attachment-uploads';
import { cn } from '@/shared/lib/cn';
import { getFileKind, getPreviewImageType } from '@/shared/lib/file-kind';
import { AlertIcon } from '@/shared/ui/icons/alert-icon';
import { EyeIcon } from '@/shared/ui/icons/eye-icon';
import { EyeOffIcon } from '@/shared/ui/icons/eye-off-icon';
import { FileTypeIcon } from '@/shared/ui/icons/file-type-icon';
import { RefreshIcon } from '@/shared/ui/icons/refresh-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';
import { LocalImage } from '@/shared/ui/local-image';

export interface AttachmentDraftsProps {
  uploads: AttachmentUpload[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  /** 있으면 이미지 첨부에 스포일러 토글을 보여준다(채팅 첨부) */
  onToggleSpoiler?: (id: string) => void;
  className?: string;
}

// 새 탭이 파일을 읽을 시간을 두고 URL을 해제한다.
const PREVIEW_URL_LIFETIME_MS = 60_000;

/**
 * 원본의 `File.type` 대신 확장자에 맞는 이미지 타입으로 고정해 연다.
 * 새 탭은 앱과 같은 출처라, HTML 같은 형식으로 해석되면 스크립트가 실행될 수 있다.
 */
function openPreview(file: File, imageType: string) {
  const url = URL.createObjectURL(new Blob([file], { type: imageType }));
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), PREVIEW_URL_LIFETIME_MS);
}

/**
 * 전송 전에 붙여 둔 파일을 타일로 보여준다.
 * 입력창 안에 두어 아직 보내지 않은 첨부라는 것이 위치만으로 드러나게 한다.
 */
export function AttachmentDrafts({
  uploads,
  onRemove,
  onRetry,
  onToggleSpoiler,
  className,
}: AttachmentDraftsProps) {
  if (uploads.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap gap-3', className)}>
      {uploads.map((upload) => (
        <li key={upload.id}>
          <AttachmentDraft
            upload={upload}
            onRemove={() => onRemove(upload.id)}
            onRetry={() => onRetry(upload.id)}
            onToggleSpoiler={
              onToggleSpoiler && (() => onToggleSpoiler(upload.id))
            }
          />
        </li>
      ))}
    </ul>
  );
}

function AttachmentDraft({
  upload,
  onRemove,
  onRetry,
  onToggleSpoiler,
}: {
  upload: AttachmentUpload;
  onRemove: () => void;
  onRetry: () => void;
  onToggleSpoiler?: () => void;
}) {
  const { file, status, spoiler = false } = upload;
  // 확장자만 이미지이고 그릴 수 없는 파일이면 미리보기를 접고 아이콘으로 보여준다.
  const [broken, setBroken] = useState(false);
  const imageType = broken ? undefined : getPreviewImageType(file.name);
  const progress = Math.max(0, Math.min(100, Math.round(upload.progress)));

  return (
    <div
      title={file.name}
      className={cn(
        'group relative flex w-36 flex-col gap-2 rounded-[14px] border bg-surface-container-low p-2',
        status === 'failed' ? 'border-error' : 'border-outline-variant',
      )}
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[10px] bg-surface-container text-on-surface-variant">
        {imageType ? (
          <LocalImage
            file={file}
            alt=""
            className={cn(
              'size-full object-cover',
              spoiler && 'scale-110 blur-lg',
            )}
            onError={() => setBroken(true)}
          />
        ) : (
          <FileTypeIcon kind={getFileKind(file.name)} size={40} />
        )}

        {imageType && spoiler && status !== 'failed' && (
          <span className="absolute rounded-md bg-black/60 px-2 py-0.5 typography-label-x-small text-white">
            스포일러
          </span>
        )}

        {status === 'uploading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70 px-4">
            <div
              role="progressbar"
              aria-label={`${file.name} 업로드 진행률`}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 w-full overflow-hidden rounded-full bg-surface-variant"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'sending' && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70">
            <p
              role="status"
              className="typography-label-x-small text-on-surface-variant"
            >
              보내는 중…
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-error/15">
            <AlertIcon size={28} className="text-error" />
            <button
              type="button"
              onClick={onRetry}
              className="flex h-7 cursor-pointer items-center gap-1 rounded-md bg-surface-container-low px-2 typography-label-x-small text-on-surface shadow-sm hover:bg-surface-container"
            >
              <RefreshIcon size={14} />
              다시 시도
            </button>
          </div>
        )}
      </div>

      <p className="truncate typography-label-x-small text-on-surface">
        {file.name}
      </p>
      {status === 'failed' && upload.error && (
        <p role="alert" className="typography-label-x-small text-error">
          {upload.error}
        </p>
      )}

      <div className="pointer-events-none absolute -top-2 -right-2 flex items-center gap-0.5 rounded-[10px] border border-outline-variant bg-surface-container-low p-0.5 opacity-0 shadow-sm transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
        {imageType && onToggleSpoiler && (
          <button
            type="button"
            onClick={onToggleSpoiler}
            aria-pressed={spoiler}
            aria-label={
              spoiler
                ? `${file.name} 스포일러 해제`
                : `${file.name} 스포일러로 가리기`
            }
            title={spoiler ? '스포일러 해제' : '스포일러로 가리기'}
            className={cn(
              'flex size-7 cursor-pointer items-center justify-center rounded-md hover:bg-surface-variant',
              spoiler
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            <EyeOffIcon size={16} />
          </button>
        )}
        {imageType && (
          <button
            type="button"
            onClick={() => openPreview(file, imageType)}
            aria-label={`${file.name} 미리보기`}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
          >
            <EyeIcon size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${file.name} 첨부 삭제`}
          className="flex size-7 cursor-pointer items-center justify-center rounded-md text-error hover:bg-error/10"
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );
}
