'use client';

import { useEffect, useState } from 'react';

import { useHideDm } from '@/features/dm-manage/model/use-hide-dm';
import { useToggleBlock } from '@/features/dm-manage/model/use-toggle-block';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { MoreIcon } from '@/shared/ui/icons/more-icon';
import { Menu } from '@/shared/ui/menu';
import { MenuItem } from '@/shared/ui/menu-item';

export interface DmConversationMenuProps {
  channelId: number;
  /** 상대 사용자. 아직 모르면 차단 항목을 비활성화한다. */
  peerId?: number;
  peerName?: string;
}

type Confirm = 'hide' | 'block' | null;

export function DmConversationMenu({
  channelId,
  peerId,
  peerName = '상대',
}: DmConversationMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const hideDm = useHideDm(channelId);
  const block = useToggleBlock(peerId);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const choose = (next: Confirm) => {
    setMenuOpen(false);
    setConfirm(next);
  };

  const isPending = hideDm.isPending || block.isPending;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="대화 설정"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
        className="flex cursor-pointer text-on-surface-variant hover:text-on-surface"
      >
        <MoreIcon size={20} />
      </button>

      {menuOpen && (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-full right-0 z-50 mt-2">
            <Menu>
              <MenuItem onClick={() => choose('hide')}>대화 숨기기</MenuItem>
              <MenuItem
                danger={!block.isBlocked}
                disabled={peerId === undefined}
                onClick={() => {
                  if (block.isBlocked) {
                    setMenuOpen(false);
                    block.toggle();
                  } else {
                    choose('block');
                  }
                }}
              >
                {block.isBlocked ? '차단 해제' : '차단하기'}
              </MenuItem>
            </Menu>
          </div>
        </>
      )}

      <Dialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={
          confirm === 'block'
            ? `${peerName}님을 차단할까요?`
            : '이 대화를 숨길까요?'
        }
        description={
          confirm === 'block'
            ? '차단하면 상대가 보내는 DM을 받지 않아요. 언제든 다시 풀 수 있어요.'
            : '목록에서만 사라지고, 상대가 새 메시지를 보내면 다시 나타나요.'
        }
      >
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={isPending}
          onClick={() => setConfirm(null)}
        >
          취소
        </Button>
        <Button
          type="button"
          color={confirm === 'block' ? 'danger' : 'brand'}
          disabled={isPending}
          onClick={() => {
            if (confirm === 'block') {
              block.toggle();
              setConfirm(null);
            } else {
              hideDm.mutate();
            }
          }}
        >
          {confirm === 'block' ? '차단' : '숨기기'}
        </Button>
      </Dialog>
    </div>
  );
}
