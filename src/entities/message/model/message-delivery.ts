import { type Thread } from '@/entities/message/model/message';

/**
 * 서버는 메시지 전송을 접수만 하고 저장은 비동기로 한다.
 * 저장이 끝나면 소켓 `message` 이벤트에 보낸 쪽의 `clientMessageId`가 실려 오므로,
 * 그 이벤트를 "실제로 저장됨" 신호로 쓴다.
 */
const listeners = new Map<string, () => void>();

/**
 * 이 메시지가 저장되면 resolve되는 Promise를 만든다.
 * 소켓 이벤트가 접수 응답보다 먼저 올 수 있으므로 전송 전에 불러 둔다.
 * 기다림이 끝나면 `cancel`로 정리한다.
 */
export function waitForStoredMessage(clientMessageId: string) {
  const stored = new Promise<void>((resolve) => {
    listeners.set(clientMessageId, resolve);
  });

  return { stored, cancel: () => listeners.delete(clientMessageId) };
}

/** 소켓으로 저장된 메시지를 받았을 때 기다리던 쪽에 알린다. */
export function notifyMessageStored(clientMessageId: string | null) {
  if (clientMessageId === null) return;

  listeners.get(clientMessageId)?.();
  listeners.delete(clientMessageId);
}

const threadListeners = new Map<string, (thread: Thread | null) => void>();

export function waitForThread(parentMessageId: string) {
  const settled = new Promise<Thread | null>((resolve) => {
    threadListeners.set(parentMessageId, resolve);
  });

  return { settled, cancel: () => threadListeners.delete(parentMessageId) };
}

export function notifyThreadSettled(
  parentMessageId: string,
  thread: Thread | null,
) {
  threadListeners.get(parentMessageId)?.(thread);
  threadListeners.delete(parentMessageId);
}
