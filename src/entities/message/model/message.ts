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
  type: 'TEXT' | 'FILE';
  attachments?: { objectKey: string }[];
  parentMessageId?: string;
  clientMessageId: string;
}

export interface CreateFileUploadUrlRequest {
  filename: string;
  contentType: string;
  size: number;
}

export interface FileUploadUrl {
  objectKey: string;
  uploadUrl: string;
  expiresInSeconds: number;
  /** PUT 업로드에 그대로 실어야 하는 헤더 */
  headers: Record<string, string>;
}

/** 업로드 확인을 마친 첨부. 메시지 전송 시 `objectKey`를 넘긴다. */
export interface ConfirmedFile {
  objectKey: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface AttachmentDownload {
  downloadUrl: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface ChannelFile {
  fileId: string;
  messageId: string;
  fileName: string;
  fileSize: number;
  attachmentIndex: number;
  objectKey?: string;
  mimeType: string;
  uploaderId: number;
  uploaderName: string;
  uploadedAt: string;
}

export interface ChannelFilePage {
  files: ChannelFile[];
  nextCursor: string | null;
}

export interface MessageEditedEvent {
  messageId: string;
  content: string;
  editedAt?: string;
}

export interface MessageDeletedEvent {
  messageId: string;
}

export interface ChannelUnread {
  channelId: number;
  unreadCount: number;
}

export interface MessagePinEvent {
  messageId: string;
  channelId: number;
}

export interface EditMessageRequest {
  content: string;
}

export interface MessageReactionEvent {
  messageId: string;
  channelId: number;
  emoji: string;
  userId: number;
  /** 변경 후 이 이모지의 반응 수 */
  count: number;
}

export interface SearchMessagesParams {
  q: string;
  channelId?: number;
  authorId?: number;
  type?: MessageType;
  hasFile?: boolean;
  before?: string;
  limit?: number;
}

export interface SearchMessageItem {
  messageId: string;
  channelId: number;
  authorId: number;
  content: string;
  /** 검색어를 `<em>`으로 감싼 본문 조각 */
  highlight: string[];
  type: MessageType;
  hasAttachments: boolean;
  isPinned: boolean;
  createdAt: string;
}

export interface SearchMessagesPage {
  messages: SearchMessageItem[];
  nextCursor: string | null;
}

export interface GithubIssueCommandPayload {
  projectId: number;
  title: string;
  body?: string;
}

export interface SlashCommandRequest {
  command: 'github.issue.create';
  payload: GithubIssueCommandPayload;
}
