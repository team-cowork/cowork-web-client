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
import { DeleteMessageDialog } from '@/features/message-delete/ui/delete-message-dialog';
import { MessageEditForm } from '@/features/message-edit/ui/message-edit-form';
import { useTogglePin } from '@/features/message-pin/model/use-toggle-pin';
import { useToggleReaction } from '@/features/message-reaction/model/use-toggle-reaction';
import { ReactionPicker } from '@/features/message-reaction/ui/reaction-picker';
import { IconButton } from '@/shared/ui/icon-button';
import { EditIcon } from '@/shared/ui/icons/edit-icon';
import { PinIcon } from '@/shared/ui/icons/pin-icon';
import { TrashIcon } from '@/shared/ui/icons/trash-icon';

export interface MessageRowProps {
  message: Message;
  timestampFormat?: MessageTimestampFormat;
  showQuote?: boolean;
  onRetry?: (message: Message) => void;
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
}: MessageRowProps) {
  const { data: me } = useQuery(userQueries.me());
  const toggleReaction = useToggleReaction(message);
  const togglePin = useTogglePin(message);
  const openAttachment = useOpenAttachment();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const interactive =
    message.type !== 'SYSTEM' && message.sendStatus === undefined;
  const isMine = me !== undefined && message.authorId === me.id;

  return (
    <>
      <MessageView
        message={message}
        timestampFormat={timestampFormat}
        showQuote={showQuote}
        onRetry={onRetry}
        onToggleReaction={interactive ? toggleReaction : undefined}
        onOpenAttachment={
          interactive
            ? (attachmentIndex) =>
                openAttachment({
                  channelId: message.channelId,
                  messageId: message._id,
                  attachmentIndex,
                })
            : undefined
        }
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
              {isMine && (
                <>
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
                  <IconButton
                    aria-label="메시지 수정"
                    size="S"
                    variant="clear"
                    onClick={() => setEditing(true)}
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
                onDone={() => setEditing(false)}
              />
            </StopClick>
          ) : undefined
        }
      />

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
