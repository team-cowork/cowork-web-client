export interface DmLastMessage {
  content: string;
  authorId: number;
  createdAt: string;
}

export interface DmConversation {
  channelId: number;
  targetUserId: number;
  unreadCount: number;
  lastMessage: DmLastMessage | null;
}
