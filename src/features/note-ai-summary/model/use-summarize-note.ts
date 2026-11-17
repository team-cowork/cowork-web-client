'use client';

import { useMutation } from '@tanstack/react-query';

import { postNoteSummary } from '@/features/note-ai-summary/api/post-note-summary';

/** 회의록 글을 AI 로 요약한다. */
export function useSummarizeNote() {
  return useMutation({ mutationFn: postNoteSummary });
}
