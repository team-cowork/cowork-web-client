'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteReaction } from '@/entities/message/api/delete-reaction';
import { postReaction } from '@/entities/message/api/post-reaction';
import { type Message } from '@/entities/message/model/message';
import { applyReaction } from '@/entities/message/model/message-cache';

interface ReactionToggle {
  emoji: string;
  /** 토글 전 내 반응 여부 */
  wasMine: boolean;
  /** 토글 전 반응 수 */
  count: number;
}

/**
 * 내 반응을 먼저 화면에 반영한 뒤 요청한다.
 * 실제 반응 수는 소켓 이벤트로 다시 맞춰진다.
 */
export function useToggleReaction(message: Message) {
  const queryClient = useQueryClient();
  const { channelId, _id: messageId } = message;

  const { mutate } = useMutation({
    mutationFn: ({ emoji, wasMine }: ReactionToggle) =>
      wasMine
        ? deleteReaction(channelId, messageId, emoji)
        : postReaction(channelId, messageId, emoji),
    onMutate: ({ emoji, wasMine, count }) => {
      applyReaction(queryClient, channelId, messageId, {
        emoji,
        count: wasMine ? count - 1 : count + 1,
        myReaction: !wasMine,
      });
    },
    onError: (_error, { emoji, wasMine, count }) => {
      applyReaction(queryClient, channelId, messageId, {
        emoji,
        count,
        myReaction: wasMine,
      });
    },
  });

  return (emoji: string) => {
    const current = message.reactions.find(
      (reaction) => reaction.emoji === emoji,
    );

    mutate({
      emoji,
      wasMine: current?.myReaction ?? false,
      count: current?.count ?? 0,
    });
  };
}
