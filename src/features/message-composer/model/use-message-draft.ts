'use client';

import { useState } from 'react';

export interface UseMessageDraftOptions {
  onSubmit: (content: string) => void;
}

/**
 * 컴포저 입력값을 관리하고, 공백만 남은 초안은 전송하지 않는다.
 * 전송에 성공하면 입력값을 비운다.
 */
export function useMessageDraft({ onSubmit }: UseMessageDraftOptions) {
  const [value, setValue] = useState('');

  const send = () => {
    const content = value.trim();

    if (content.length === 0) return;

    onSubmit(content);
    setValue('');
  };

  return { value, onChange: setValue, onSend: send };
}
