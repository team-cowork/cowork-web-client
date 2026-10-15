export interface DmLastMessage {
  content: string;
  authorId: number;
  createdAt: string;
}

export interface DmConversation {
  channelId: number;
  otherUserId: number | null;
  unreadCount: number;
  lastMessage: DmLastMessage | null;
}
