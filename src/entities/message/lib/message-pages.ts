import { type InfiniteData } from '@tanstack/react-query';

import {
  type MentionedMessage,
  type Message,
  type MessageAttachment,
} from '@/entities/message/model/message';

// 채널 목록과 스레드 답글 캐시는 모두 서버 응답 그대로 최신 메시지가 앞에 온다.
type MessagePages = InfiniteData<Message[]>;

export function isSameMessage(a: Message, b: Message): boolean {
  if (a._id === b._id) return true;

  return a.clientMessageId !== null && a.clientMessageId === b.clientMessageId;
}

// 서버가 준 첨부에는 로컬 원본이 없다. 썸네일 URL을 받는 동안에도 같은 그림을 보여주도록 유지한다.
// 순서가 바뀌어도 다른 파일과 섞이지 않도록 objectKey가 같을 때만 잇는다.
function keepLocalFiles(
  current: MessageAttachment[],
  incoming: MessageAttachment[],
): MessageAttachment[] {
  if (!current.some((attachment) => attachment.localFile)) return incoming;

  return incoming.map((attachment) => {
    if (attachment.localFile || attachment.objectKey === undefined) {
      return attachment;
    }

    const localFile = current.find(
      (cached) => cached.objectKey === attachment.objectKey,
    )?.localFile;
    return localFile ? { ...attachment, localFile } : attachment;
  });
}

// 소켓으로 온 메시지에는 원본 인용이 없으므로 이미 가진 값을 유지한다.
function mergeMessage(current: Message, incoming: Message): Message {
  return {
    ...incoming,
    attachments: keepLocalFiles(current.attachments, incoming.attachments),
    mentionedMessage: incoming.mentionedMessage ?? current.mentionedMessage,
  };
}

export function upsertNewestFirst(
  messages: Message[],
  incoming: Message,
): Message[] {
  const index = messages.findIndex((message) =>
    isSameMessage(message, incoming),
  );
  if (index === -1) return [incoming, ...messages];

  return messages.with(index, mergeMessage(messages[index]!, incoming));
}

export function upsertIntoPages(
  data: MessagePages,
  incoming: Message,
): MessagePages {
  let replaced = false;
  const pages = data.pages.map((page) =>
    page.map((message) => {
      if (replaced || !isSameMessage(message, incoming)) return message;

      replaced = true;
      return mergeMessage(message, incoming);
    }),
  );
  if (replaced) return { ...data, pages };

  const [latest = [], ...older] = pages;
  return { ...data, pages: [[incoming, ...latest], ...older] };
}

export function findInPages(
  data: MessagePages,
  messageId: string,
): Message | undefined {
  for (const page of data.pages) {
    const found = page.find((message) => message._id === messageId);
    if (found) return found;
  }

  return undefined;
}

export function toMentionedMessage(message: Message): MentionedMessage {
  return {
    _id: message._id,
    authorId: message.authorId,
    content: message.content,
    type: message.type,
    createdAt: message.createdAt,
  };
}
