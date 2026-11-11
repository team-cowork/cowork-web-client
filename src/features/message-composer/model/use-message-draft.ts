'use client';

import { useState } from 'react';

export interface UseMessageDraftOptions {
  /** `false`를 돌려주면 보내지 않은 것으로 보고 입력값을 남긴다 */
  onSubmit: (content: string) => boolean | void;
  /** 첨부처럼 본문 없이도 보낼 거리가 있으면 빈 초안도 전송한다 */
  allowEmpty?: boolean;
}

/**
 * 컴포저 입력값을 관리하고, 공백만 남은 초안은 전송하지 않는다.
 * 전송에 성공하면 입력값을 비운다.
 */
export function useMessageDraft({
  onSubmit,
  allowEmpty = false,
}: UseMessageDraftOptions) {
  const [value, setValue] = useState('');

  const send = () => {
    const content = value.trim();

    if (content.length === 0 && !allowEmpty) return;

    if (onSubmit(content) === false) return;
    setValue('');
  };

  return { value, onChange: setValue, onSend: send };
}
