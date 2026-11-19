'use client';

import { type MouseEvent, type ReactNode, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { type Message } from '@/entities/message/model/message';
import {
  MessageView,
  type MessageTimestampFormat,
} from '@/entities/message/ui/message-view';
import { userQueries } from '@/entities/user/api/user-queries';
import { useOpenAttachment } from '@/features/attachment-download/model/use-open-attachment';
import { AttachmentImageViewer } from '@/features/attachment-download/ui/attachment-image-viewer';
import { DeleteMessageDialog } from '@/features/message-delete/ui/delete-message-dialog';
import { useEditingMessageStore } from '@/features/message-edit/model/editing-message-store';
import { MessageEditForm } from '@/features/message-edit/ui/message-edit-form';
import { useTogglePin } from '@/features/message-pin/model/use-toggle-pin';
import { useToggleReaction } from '@/features/message-reaction/model/use-toggle-reaction';
import { ReactionPicker } from '@/features/message-reaction/ui/reaction-picker';
import { UserProfilePopover } from '@/features/user-profile-view/ui/user-profile-popover';
import { getPreviewImageType } from '@/shared/lib/file-kind';
import { IconButton } from '@/shared/ui/icon-button';
import { EditIcon } from '@/shared/ui/icons/edit-icon';
import { PinIcon } from '@/shared/ui/icons/pin-icon';
import { ReplyIcon } from '@/shared/ui/icons/reply-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';

export interface MessageRowProps {
  message: Message;
  timestampFormat?: MessageTimestampFormat;
  showQuote?: boolean;
  onRetry?: (message: Message) => void;
  onReply?: (message: Message) => void;
}

// 행을 누르면 스레드가 열리므로, 행 안의 조작 영역에서 일어난 클릭은 위로 올리지 않는다.
function StopClick({ children }: { children: ReactNode }) {
  return (
    <div
      className="contents"
      onClick={(event: MouseEvent) => event.stopPropagation()}
    >
      {children}
    </div>
  );
}

/**
 * 메시지 한 줄에 반응·고정·수정·삭제 조작을 붙인다.
 * 아직 전송 중이거나 실패한 메시지, 시스템 메시지에는 조작을 붙이지 않는다.
 */
export function MessageRow({
  message,
  timestampFormat,
  showQuote,
  onRetry,
  onReply,
}: MessageRowProps) {
  const { data: me } = useQuery(userQueries.me());
  const toggleReaction = useToggleReaction(message);
  const togglePin = useTogglePin(message);
  const openAttachment = useOpenAttachment();
  const editing = useEditingMessageStore(
    (state) => state.editingMessageId === message._id,
  );
  const startEditing = useEditingMessageStore((state) => state.startEditing);
  const stopEditing = useEditingMessageStore((state) => state.stopEditing);
  const [deleting, setDeleting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  // 뷰어에서 처음 보여 줄 이미지 첨부의 순번. 열려 있지 않으면 null이다.
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  // 프로필을 띄울 기준 요소(누른 작성자 아바타·이름). 닫혀 있으면 null이다.
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);

  const interactive =
    message.type !== 'SYSTEM' && message.sendStatus === undefined;
  const isMine = me !== undefined && message.authorId === me.id;

  // 이미지는 앱 안 뷰어로 보고, 나머지 파일은 새 탭으로 연다.
  const images = message.attachments.flatMap((attachment, attachmentIndex) =>
    getPreviewImageType(attachment.name)
      ? [{ messageId: message._id, attachmentIndex, name: attachment.name }]
      : [],
  );
  const openAttachmentAt = (attachmentIndex: number) => {
    const imageIndex = images.findIndex(
      (image) => image.attachmentIndex === attachmentIndex,
    );
    if (imageIndex >= 0) {
      setViewerIndex(imageIndex);
      return;
    }

    openAttachment({
      channelId: message.channelId,
      messageId: message._id,
      attachmentIndex,
    });
  };

  return (
    <>
      <MessageView
        message={message}
        timestampFormat={timestampFormat}
        showQuote={showQuote}
        onRetry={onRetry}
        onToggleReaction={interactive ? toggleReaction : undefined}
        onOpenAttachment={interactive ? openAttachmentAt : undefined}
        onOpenAuthor={message.type === 'SYSTEM' ? undefined : setProfileAnchor}
        actionsVisible={pickerOpen}
        actions={
          interactive &&
          !editing && (
            <StopClick>
              <ReactionPicker
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                onSelect={toggleReaction}
              />
              {onReply && (
                <IconButton
                  aria-label="답장"
                  size="S"
                  variant="clear"
                  onClick={() => onReply(message)}
                >
                  <ReplyIcon />
                </IconButton>
              )}
              <IconButton
                aria-label={message.isPinned ? '고정 해제' : '메시지 고정'}
                aria-pressed={message.isPinned}
                size="S"
                variant="clear"
                disabled={togglePin.isPending}
                onClick={() => togglePin.mutate()}
                className={message.isPinned ? 'text-primary' : undefined}
              >
                <PinIcon />
              </IconButton>
              {isMine && (
                <>
                  <IconButton
                    aria-label="메시지 수정"
                    size="S"
                    variant="clear"
                    onClick={() => startEditing(message._id)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="메시지 삭제"
                    size="S"
                    variant="clear"
                    onClick={() => setDeleting(true)}
                    className="text-error"
                  >
                    <TrashIcon />
                  </IconButton>
                </>
              )}
            </StopClick>
          )
        }
        editor={
          editing ? (
            <StopClick>
              <MessageEditForm
                message={message}
                onDone={() => stopEditing(message._id)}
              />
            </StopClick>
          ) : undefined
        }
      />

      {viewerIndex !== null && (
        <StopClick>
          <AttachmentImageViewer
            channelId={message.channelId}
            images={images}
            initialIndex={viewerIndex}
            onClose={() => setViewerIndex(null)}
          />
        </StopClick>
      )}

      {profileAnchor && (
        <StopClick>
          <UserProfilePopover
            userId={message.authorId}
            anchor={profileAnchor}
            onClose={() => setProfileAnchor(null)}
          />
        </StopClick>
      )}

      {isMine && (
        <StopClick>
          <DeleteMessageDialog
            message={message}
            open={deleting}
            onClose={() => setDeleting(false)}
          />
        </StopClick>
      )}
    </>
  );
}
