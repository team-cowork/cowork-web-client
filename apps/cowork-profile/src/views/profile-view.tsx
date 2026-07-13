import { useState } from 'react';

import { Avatar, Badge, Button, Modal, TextField } from '@cowork/ui';

const CHIPS = ['GSM 2학년 3반', 'GitHub @junjuny0227', 'DataGSM 연동됨'];

// ponytail: 커밋 스트릭은 시연용이라 결정론적 의사난수로 셀 강도 채운다. 실 데이터 붙으면 배열 주입.
const HEAT_LEVELS = [
  'bg-surface-container-low',
  'bg-cowork-green-900',
  'bg-cowork-green-600',
  'bg-cowork-green-500',
  'bg-cowork-green-400',
];
const heatLevel = (i: number) => HEAT_LEVELS[((i * 1103515245 + 12345) >>> 8) % HEAT_LEVELS.length];

export function ProfileView() {
  const [name, setName] = useState('junjuny');
  const [role, setRole] = useState('백엔드 개발자');
  const [open, setOpen] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftRole, setDraftRole] = useState(role);

  const openEdit = () => {
    setDraftName(name);
    setDraftRole(role);
    setOpen(true);
  };

  const save = () => {
    if (!draftName.trim()) return;
    setName(draftName.trim());
    setRole(draftRole.trim());
    setOpen(false);
  };

  return (
    <div className="bg-surface-container-high flex h-full flex-col">
      <header className="border-outline-variant flex h-12 shrink-0 items-center border-b px-5">
        <span className="text-on-surface text-[16px] font-semibold">프로필</span>
      </header>

      <div className="flex flex-1 flex-col items-center overflow-y-auto py-8">
        <div className="flex w-[760px] max-w-full flex-col gap-5 px-4">
          {/* Profile card */}
          <div className="bg-surface flex flex-col overflow-hidden rounded-[16px]">
            <div className="h-[120px] w-full bg-gradient-to-r from-[#f04552] to-[#3b70f0]" />
            <div className="flex items-end justify-between px-6 pt-4 pb-5">
              <div className="flex items-end gap-4">
                <div className="bg-surface rounded-[28px] p-1">
                  <Avatar name={name} tone="blue" size={88} />
                </div>
                <div className="flex flex-col gap-1.5 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface text-[22px] font-bold">{name}</span>
                    <Badge color="brand">팀 어드민</Badge>
                    <Badge color="green">개발</Badge>
                  </div>
                  <span className="text-on-surface-variant text-[14px]">@junjuny0227 · {role}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={openEdit}
                className="bg-surface-container text-on-surface-variant h-9 shrink-0 rounded-[10px] px-3.5 text-[15px] font-semibold"
              >
                프로필 편집
              </button>
            </div>
          </div>

          {/* Chips */}
          <div className="flex gap-2.5">
            {CHIPS.map((chip) => (
              <span
                key={chip}
                className="bg-surface-container-low text-on-surface-variant rounded-[8px] px-2.5 py-[5px] text-[13px] font-medium"
              >
                {chip}
              </span>
            ))}
          </div>

          {/* Commit streak */}
          <div className="bg-surface flex flex-col gap-3.5 rounded-[16px] px-5 pt-[18px] pb-5">
            <div className="flex items-center justify-between">
              <span className="text-on-surface text-[15px] font-semibold">GitHub 커밋 스트릭</span>
              <span className="text-on-surface-variant text-[12px]">최근 20주 · 노출 ON</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 20 }).map((_, col) => (
                <div key={col} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, row) => (
                    <span
                      key={row}
                      className={`size-[13px] rounded-[3px] ${heatLevel(col * 7 + row)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="프로필 편집"
        footer={
          <>
            <Button variant="weak" color="neutral" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={save} disabled={!draftName.trim()}>
              저장
            </Button>
          </>
        }
      >
        <TextField
          label="이름"
          value={draftName}
          autoFocus
          onChange={(e) => setDraftName(e.target.value)}
        />
        <TextField
          label="소개"
          placeholder="예: 백엔드 개발자"
          value={draftRole}
          onChange={(e) => setDraftRole(e.target.value)}
        />
      </Modal>
    </div>
  );
}
