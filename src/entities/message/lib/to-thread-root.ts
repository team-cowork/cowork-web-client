import { type Message } from '@/entities/message/model/message';

/**
 * 선택한 메시지로 열 스레드의 원본 메시지를 구한다.
 * 답글을 고르면 그 답글이 가리키는 원본의 스레드를 연다. 원본을 알 수 없으면 `null`.
 */
export function toThreadRoot(message: Message): Message | null {
  if (message.parentMessageId === null) return message;

  const parent = message.mentionedMessage;
  if (!parent) return null;

  return {
    _id: parent._id,
    teamId: message.teamId,
    projectId: message.projectId,
    channelId: message.channelId,
    authorId: parent.authorId,
    content: parent.content,
    type: parent.type,
    attachments: [],
    parentMessageId: null,
    isEdited: false,
    isPinned: false,
    clientMessageId: null,
    mentions: [],
    reactions: [],
    createdAt: parent.createdAt,
    updatedAt: parent.createdAt,
  };
}
