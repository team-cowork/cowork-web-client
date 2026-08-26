export interface Message {
  id: number;
  channelId: number;
  authorId: number;
  authorName: string;
  authorImageUrl: string | null;
  content: string;
  createdAt: string;
}
