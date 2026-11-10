'use client';

import { type SyntheticEvent, useEffect, useState } from 'react';

import { type Webhook } from '@/entities/webhook/model/webhook';
import { useWebhookMutations } from '@/features/webhook-manage/model/use-webhook-mutations';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { IconButton } from '@/shared/ui/icon-button';
import { MoreIcon } from '@/shared/ui/icons/more-icon';
import { Menu, MenuSeparator } from '@/shared/ui/menu';
import { MenuItem } from '@/shared/ui/menu-item';
import { Modal } from '@/shared/ui/modal';
import { Switch } from '@/shared/ui/switch';
import { TextField } from '@/shared/ui/text-field';

export function WebhookManageActions({
  channelId,
  webhook,
  onToken,
}: {
  channelId: number;
  webhook: Webhook;
  onToken: (token: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [action, setAction] = useState<
    'rename' | 'regenerate' | 'delete' | null
  >(null);
  const [name, setName] = useState(webhook.name);
  const { update, security, regenerate, remove, isPending } =
    useWebhookMutations(channelId, webhook.id, onToken);
  const close = () => {
    if (!isPending) setAction(null);
  };
  const trimmedName = name.trim();
  const validName = trimmedName.length >= 1 && trimmedName.length <= 100;

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const rename = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!validName || isPending) return;
    update.mutate({ name: trimmedName }, { onSuccess: () => setAction(null) });
  };

  return (
    <div className="flex shrink-0 items-center gap-3">
      <span className="typography-subtext-medium text-on-surface-variant">
        활성
      </span>
      <Switch
        aria-label={`${webhook.name} 활성`}
        checked={webhook.isActive}
        disabled={isPending}
        onCheckedChange={(isActive) => update.mutate({ isActive })}
      />
      <div className="relative">
        <IconButton
          aria-label={`${webhook.name} 웹훅 메뉴`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          size="S"
          variant="border"
          disabled={isPending}
          onClick={() => setMenuOpen((previous) => !previous)}
        >
          <MoreIcon size={16} />
        </IconButton>
        {menuOpen && (
          <>
            <div
              aria-hidden
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="absolute top-full right-0 z-50 mt-2"
              onClick={() => setMenuOpen(false)}
            >
              <Menu>
                <MenuItem
                  onClick={() => {
                    setName(webhook.name);
                    setAction('rename');
                  }}
                >
                  이름 변경
                </MenuItem>
                <MenuItem
                  disabled={isPending}
                  onClick={() => security.mutate(!webhook.isSecure)}
                >
                  {webhook.isSecure ? '보안 모드 끄기' : '보안 모드 켜기'}
                </MenuItem>
                <MenuItem onClick={() => setAction('regenerate')}>
                  실행 URL 재발급
                </MenuItem>
                <MenuSeparator />
                <MenuItem danger onClick={() => setAction('delete')}>
                  웹훅 삭제
                </MenuItem>
              </Menu>
            </div>
          </>
        )}
      </div>
      <Modal open={action === 'rename'} onClose={close} title="웹훅 이름 변경">
        <form onSubmit={rename} className="flex flex-col gap-4">
          <TextField
            label="웹훅 이름"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={1}
            maxLength={100}
            required
            autoFocus
            disabled={isPending}
            error={!validName ? '이름은 1~100자로 입력해 주세요.' : undefined}
          />
          <div className="flex justify-end gap-2.5">
            <Button
              variant="weak"
              color="neutral"
              onClick={close}
              disabled={isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={!validName || isPending}>
              {update.isPending ? '저장하는 중…' : '저장'}
            </Button>
          </div>
        </form>
      </Modal>
      <Dialog
        open={action === 'regenerate'}
        onClose={close}
        title="실행 URL을 재발급할까요?"
        description="재발급하면 이전 URL은 더 이상 작동하지 않아요. 연결된 서비스의 URL도 새 URL로 바꿔 주세요."
      >
        <Button
          variant="weak"
          color="neutral"
          onClick={close}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          disabled={isPending}
          onClick={() =>
            regenerate.mutate(undefined, { onSuccess: () => setAction(null) })
          }
        >
          {regenerate.isPending ? '재발급하는 중…' : '재발급'}
        </Button>
      </Dialog>
      <Dialog
        open={action === 'delete'}
        onClose={close}
        title="웹훅을 삭제할까요?"
        description={`"${webhook.name}" 웹훅이 삭제되고 되돌릴 수 없어요. 이 웹훅으로 보내는 메시지도 더 이상 받을 수 없어요.`}
      >
        <Button
          variant="weak"
          color="neutral"
          onClick={close}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          color="danger"
          disabled={isPending}
          onClick={() =>
            remove.mutate(undefined, { onSuccess: () => setAction(null) })
          }
        >
          {remove.isPending ? '삭제하는 중…' : '삭제'}
        </Button>
      </Dialog>
    </div>
  );
}
