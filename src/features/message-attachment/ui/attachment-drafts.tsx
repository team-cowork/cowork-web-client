'use client';

import { type AttachmentUpload } from '@/features/message-attachment/model/use-attachment-uploads';
import { cn } from '@/shared/lib/cn';
import { AlertIcon } from '@/shared/ui/icons/alert-icon';
import { EyeIcon } from '@/shared/ui/icons/eye-icon';
import { FileIcon } from '@/shared/ui/icons/file-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';
import { LocalImage } from '@/shared/ui/local-image';

export interface AttachmentDraftsProps {
  uploads: AttachmentUpload[];
  onRemove: (id: string) => void;
  className?: string;
}

// SVG는 새 탭에서 앱과 같은 출처로 스크립트가 실행될 수 있어 비트맵 이미지만 미리 본다.
const PREVIEWABLE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/bmp',
]);

// 새 탭이 파일을 읽을 시간을 두고 URL을 해제한다.
const PREVIEW_URL_LIFETIME_MS = 60_000;

function openPreview(file: File) {
  const url = URL.createObjectURL(file);
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
          />
        </li>
      ))}
    </ul>
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
  const isImage = file.type.startsWith('image/');
  const canPreview = PREVIEWABLE_TYPES.has(file.type);
  const progress = Math.max(0, Math.min(100, Math.round(upload.progress)));

  return (
    <div
      title={status === 'failed' ? '업로드에 실패해 보내지 않아요' : file.name}
      className={cn(
        'group relative flex w-36 flex-col gap-2 rounded-[14px] border bg-surface-container-low p-2',
        status === 'failed' ? 'border-error' : 'border-outline-variant',
      )}
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[10px] bg-surface-container text-on-surface-variant">
        {isImage ? (
          <LocalImage file={file} alt="" className="size-full object-cover" />
        ) : (
          <FileIcon size={40} />
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

        {status === 'failed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-error/15">
            <AlertIcon
              size={32}
              role="img"
              aria-hidden={false}
              aria-label="업로드 실패"
              className="text-error"
            />
          </div>
        )}
      </div>

      <p className="truncate typography-label-x-small text-on-surface">
        {file.name}
      </p>

      <div className="pointer-events-none absolute -top-2 -right-2 flex items-center gap-0.5 rounded-[10px] border border-outline-variant bg-surface-container-low p-0.5 opacity-0 shadow-sm transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
        {canPreview && (
          <button
            type="button"
            onClick={() => openPreview(file)}
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
