'use client';

import { type SyntheticEvent, useState } from 'react';

import { useCreateWebhook } from '@/features/webhook-create/model/use-create-webhook';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { SettingRow } from '@/shared/ui/setting-row';
import { Switch } from '@/shared/ui/switch';
import { TextField } from '@/shared/ui/text-field';

export function CreateWebhookButton({
  channelId,
  onToken,
}: {
  channelId: number;
  onToken: (token: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const createWebhook = useCreateWebhook(channelId, (token) => {
    setOpen(false);
    if (token !== null) onToken(token);
  });
  const close = () => {
    if (!createWebhook.isPending) setOpen(false);
  };

  return (
    <>
      <Button disabled={createWebhook.isPending} onClick={() => setOpen(true)}>
        웹훅 만들기
      </Button>
      <Modal open={open} onClose={close} title="웹훅 만들기">
        {open && (
          <CreateWebhookForm createWebhook={createWebhook} onClose={close} />
        )}
      </Modal>
    </>
  );
}

function CreateWebhookForm({
  createWebhook,
  onClose,
}: {
  createWebhook: ReturnType<typeof useCreateWebhook>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [isSecure, setIsSecure] = useState(false);
  const trimmedName = name.trim();
  const validName = trimmedName.length >= 1 && trimmedName.length <= 100;

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    if (!validName || createWebhook.isPending) return;
    createWebhook.mutate({ name: trimmedName, isSecure, isActive: true });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="웹훅 이름"
        placeholder="웹훅 이름을 입력해 주세요"
        value={name}
        onChange={(event) => setName(event.target.value)}
        minLength={1}
        maxLength={100}
        required
        autoFocus
        disabled={createWebhook.isPending}
        error={
          name.length > 0 && !validName
            ? '이름은 1~100자로 입력해 주세요.'
            : undefined
        }
      />
      <SettingRow
        label="보안 모드"
        description="실행 요청에 X-Webhook-Secret 헤더가 필요해요."
      >
        <Switch
          aria-label="보안 모드"
          checked={isSecure}
          onCheckedChange={setIsSecure}
          disabled={createWebhook.isPending}
        />
      </SettingRow>
      {createWebhook.isError && (
        <p role="alert" className="typography-subtext-medium text-error">
          만들지 못했어요. 같은 내용으로 다시 시도할 수 있어요.
        </p>
      )}
      <div className="flex justify-end gap-2.5">
        <Button
          variant="weak"
          color="neutral"
          onClick={onClose}
          disabled={createWebhook.isPending}
        >
          취소
        </Button>
        <Button type="submit" disabled={!validName || createWebhook.isPending}>
          {createWebhook.isPending ? '만드는 중…' : '만들기'}
        </Button>
      </div>
    </form>
  );
}
