'use client';

import { type KeyboardEvent, useLayoutEffect, useRef } from 'react';

import {
  EDITOR_BULLET,
  isEditorBulletLine,
  toEditorBullets,
} from '@/entities/meeting-note/lib/editor-fields';
import { cn } from '@/shared/lib/cn';

export interface BulletTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  'aria-label': string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
}

/**
 * 내용 길이에 맞춰 늘어나는 입력 칸.
 * 줄 맨 앞의 `- `는 글머리 기호로 바꾸고, 목록에서 Enter를 누르면 다음 항목을 이어 준다.
 */
export function BulletTextArea({
  value,
  onChange,
  className,
  ...props
}: BulletTextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  // 값을 바꿔 넣으면 커서가 끝으로 가므로, 그려진 뒤 되돌릴 위치를 기억해 둔다.
  const pendingSelection = useRef<[start: number, end: number] | null>(null);

  useLayoutEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (pendingSelection.current) {
      textarea.setSelectionRange(...pendingSelection.current);
      pendingSelection.current = null;
    }
  }, [value]);

  const replace = (next: string, cursor: number) => {
    pendingSelection.current = [cursor, cursor];
    onChange(next);
  };

  const handleChange = (textarea: HTMLTextAreaElement) => {
    const converted = toEditorBullets(textarea.value);
    // 중간 줄 맨 앞에 `- `를 치거나 목록을 붙여 넣으면 바뀐 값이 들어가 커서가 튄다.
    // 표기의 길이가 같아 바꾸기 전 커서 위치를 그대로 쓰면 된다.
    if (converted !== textarea.value) {
      pendingSelection.current = [
        textarea.selectionStart,
        textarea.selectionEnd,
      ];
    }
    onChange(converted);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 조합 중 Enter는 글자를 확정하는 키라 건드리지 않는다.
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;

    const { selectionStart, selectionEnd } = event.currentTarget;
    if (selectionStart !== selectionEnd) return;

    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const line = value.slice(lineStart, selectionStart);
    if (!isEditorBulletLine(line)) return;

    event.preventDefault();
    if (line === EDITOR_BULLET) {
      // 빈 항목에서 Enter를 누르면 목록을 끝낸다.
      replace(
        value.slice(0, lineStart) + value.slice(selectionStart),
        lineStart,
      );
      return;
    }
    const insert = `\n${EDITOR_BULLET}`;
    replace(
      value.slice(0, selectionStart) + insert + value.slice(selectionStart),
      selectionStart + insert.length,
    );
  };

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(event) => handleChange(event.target)}
      onKeyDown={handleKeyDown}
      className={cn('resize-none overflow-hidden', className)}
      {...props}
    />
  );
}
