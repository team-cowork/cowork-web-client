import { type Message } from '@/entities/message/model/message';

/**
 * 서버는 본문이 빈 메시지를 저장하지 않아(전송 요청은 받지만 저장 단계에서 버린다),
 * 첨부만 보낼 때는 파일 이름을 본문으로 채운다.
 */
export function toAttachmentContent(files: { name: string }[]): string {
  return files.map((file) => file.name).join(', ');
}

/** 본문이 첨부 파일 이름으로 채운 대체 본문이면 화면에서는 카드만 보여준다. */
export function isAttachmentOnlyContent(
  message: Pick<Message, 'content' | 'attachments'>,
): boolean {
  return (
    message.attachments.length > 0 &&
    message.content === toAttachmentContent(message.attachments)
  );
}
