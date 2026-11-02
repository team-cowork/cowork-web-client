'use client';

import { AttachmentCard } from '@/entities/attachment/ui/attachment-card';
import { type AttachmentUpload } from '@/features/message-attachment/model/use-attachment-uploads';
import { FileUploadProgress } from '@/features/file-upload/ui/file-upload-progress';
import { cn } from '@/shared/lib/cn';
import { formatFileSize } from '@/shared/lib/format-file-size';

export interface AttachmentDraftsProps {
  uploads: AttachmentUpload[];
  onRemove: (id: string) => void;
  className?: string;
}

/** 전송 전에 붙여 둔 파일. 올리는 중이면 진행률을, 끝나면 카드를 보여준다. */
export function AttachmentDrafts({
  uploads,
  onRemove,
  className,
}: AttachmentDraftsProps) {
  if (uploads.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {uploads.map((upload) => (
        <li key={upload.id} className="w-64">
          {upload.status === 'uploading' ? (
            <FileUploadProgress
              name={upload.file.name}
              progress={upload.progress}
            />
          ) : (
            <AttachmentCard
              name={upload.file.name}
              meta={
                upload.status === 'failed'
                  ? '업로드 실패'
                  : formatFileSize(upload.file.size)
              }
              onRemove={() => onRemove(upload.id)}
              className={cn(upload.status === 'failed' && 'border-error')}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
