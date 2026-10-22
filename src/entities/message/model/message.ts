export type MessageType = 'TEXT' | 'FILE' | 'SYSTEM';

export interface MessageAttachment {
  name: string;
  objectKey?: string;
  size: number;
  mimeType: string;
}

/** 답글이 가리키는 원본 메시지 요약. 메시지 목록 조회 응답에만 포함된다. */
export interface MentionedMessage {
  _id: string;
  authorId: number;
  content: string;
  type: MessageType;
  createdAt: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  myReaction: boolean;
}

/** 낙관적으로 먼저 그린 메시지의 전송 상태. 서버에서 받은 메시지에는 없다. */
export type MessageSendStatus = 'pending' | 'failed';

export interface Message {
  _id: string;
  teamId: number | null;
  projectId: number | null;
  channelId: number;
  authorId: number;
  content: string;
  type: MessageType;
  attachments: MessageAttachment[];
  parentMessageId: string | null;
  isEdited: boolean;
  isPinned: boolean;
  clientMessageId: string | null;
  mentions: number[];
  reactions: MessageReaction[];
  createdAt: string;
  updatedAt: string;
  mentionedMessage?: MentionedMessage | null;
  sendStatus?: MessageSendStatus;
}

export interface GetMessagesParams {
  before?: string;
  parentMessageId?: string;
}

export interface SendMessageRequest {
  content: string;
  parentMessageId?: string;
  clientMessageId: string;
}

export interface MessageEditedEvent {
  messageId: string;
  content: string;
  editedAt?: string;
}

export interface MessageDeletedEvent {
  messageId: string;
}

export interface MessageReactionEvent {
  messageId: string;
  channelId: number;
  emoji: string;
  userId: number;
  /** 변경 후 이 이모지의 반응 수 */
  count: number;
}
