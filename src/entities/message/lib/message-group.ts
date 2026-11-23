import { type Message } from '@/entities/message/model/message';

const GROUP_WINDOW_MS = 5 * 60 * 1000;

export function continuesPrevious(
  previous: Message | undefined,
  message: Message,
): boolean {
  if (!previous || previous.type === 'SYSTEM' || message.type === 'SYSTEM') {
    return false;
  }
  if (previous.authorId !== message.authorId) return false;
  if (message.parentMessageId !== null) return false;

  const gap = Date.parse(message.createdAt) - Date.parse(previous.createdAt);
  return gap >= 0 && gap < GROUP_WINDOW_MS;
}
