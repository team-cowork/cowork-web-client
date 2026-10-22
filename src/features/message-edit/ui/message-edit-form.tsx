'use client';

import { type KeyboardEvent, useState } from 'react';

import { type Message } from '@/entities/message/model/message';
import { useEditMessage } from '@/features/message-edit/model/use-edit-message';

export interface MessageEditFormProps {
  message: Message;
  onDone: () => void;
}

/** 메시지 본문 자리에서 바로 고친다. Enter로 저장, Esc로 취소. */
export function MessageEditForm({ message, onDone }: MessageEditFormProps) {
  const [value, setValue] = useState(message.content);
  const { mutate, isPending, isError } = useEditMessage(message);

  const save = () => {
    const content = value.trim();
    if (content.length === 0 || isPending) return;
    if (content === message.content) {
      onDone();
      return;
    }

    mutate(content, { onSuccess: onDone });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      onDone();
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      save();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        autoFocus
        aria-label="메시지 수정"
        rows={Math.min(value.split('\n').length, 8)}
        value={value}
        disabled={isPending}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={(event) =>
          event.currentTarget.setSelectionRange(value.length, value.length)
        }
        className="w-full resize-none rounded-[12px] border border-outline-variant bg-surface px-3 py-2 typography-subtext-large text-on-surface focus:border-primary focus:outline-none"
      />
      <p className="flex items-center gap-1 typography-subtext-small text-on-surface-variant">
        {isError && <span className="mr-1 text-error">수정에 실패했어요.</span>}
        Esc로
        <button
          type="button"
          onClick={onDone}
          className="cursor-pointer text-primary hover:underline"
        >
          취소
        </button>
        · Enter로
        <button
          type="button"
          onClick={save}
          className="cursor-pointer text-primary hover:underline"
        >
          저장
        </button>
      </p>
    </div>
  );
}
