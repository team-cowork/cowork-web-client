import { type ReactNode, useState } from 'react';

import {
  Avatar,
  Button,
  ChannelListItem,
  ChevronDownIcon,
  FolderIcon,
  HashIcon,
  Modal,
  PlusIcon,
  SettingsIcon,
  Switch,
  TextField,
} from '@cowork/ui';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';

import { useWorkspace, WorkspaceProvider } from '../shared/workspace';

function TeamRail() {
  const navigate = useNavigate();
  const { teams, activeTeam, selectTeam, createTeam } = useWorkspace();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    createTeam(name);
    setName('');
    setModalOpen(false);
    navigate({ to: '/chat' });
  };

  return (
    <nav className="bg-background flex h-full w-[72px] shrink-0 flex-col items-center gap-2 overflow-clip py-3">
      <button
        type="button"
        onClick={() => navigate({ to: '/chat' })}
        className="bg-primary text-on-primary flex size-12 items-center justify-center rounded-[16px] text-[18px]"
      >
        co
      </button>
      <span className="bg-outline-variant h-[2px] w-8 rounded-[1px]" />

      {teams.map((team) => {
        const active = team.id === activeTeam.id;
        return (
          <div key={team.id} className="relative flex w-full justify-center">
            <span
              className={`bg-on-surface absolute top-1/2 left-0 w-1 -translate-y-1/2 rounded-r-full transition-all ${
                active ? 'h-6' : 'h-0'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                selectTeam(team.id);
                navigate({ to: '/chat' });
              }}
              className={`bg-tertiary-container text-on-tertiary-container typography-title-large flex size-12 items-center justify-center transition-[border-radius] ${
                active ? 'rounded-[16px]' : 'rounded-[24px] hover:rounded-[16px]'
              }`}
            >
              {team.label}
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="bg-surface text-primary flex size-12 items-center justify-center rounded-[24px] transition-[border-radius] hover:rounded-[16px] hover:bg-primary-container"
        aria-label="서버 추가"
      >
        <PlusIcon size={22} />
      </button>

      <CreateTeamModal
        open={modalOpen}
        name={name}
        onName={setName}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
      />
    </nav>
  );
}

function CreateTeamModal({
  open,
  name,
  onName,
  onClose,
  onSubmit,
}: {
  open: boolean;
  name: string;
  onName: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="서버 만들기"
      footer={
        <>
          <Button variant="weak" color="neutral" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onSubmit} disabled={!name.trim()}>
            만들기
          </Button>
        </>
      }
    >
      <TextField
        label="서버 이름"
        placeholder="예: 코웍 팀"
        value={name}
        autoFocus
        onChange={(e) => onName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && onSubmit()}
      />
    </Modal>
  );
}

function ChannelSidebar() {
  const navigate = useNavigate();
  const { activeTeam, activeChannel, selectChannel, createChannel } = useWorkspace();
  const section = useRouterState({ select: (s) => s.location.pathname.split('/')[1] ?? '' });
  const [group, setGroup] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [voice, setVoice] = useState(false);

  const submit = () => {
    if (!name.trim() || !group) return;
    createChannel(group, name, voice);
    setName('');
    setVoice(false);
    setGroup(null);
    navigate({ to: '/chat' });
  };

  return (
    <aside className="bg-surface flex h-full w-60 shrink-0 flex-col">
      <header className="border-outline-variant flex h-12 shrink-0 items-center justify-between border-b pr-3 pl-4">
        <span className="text-on-surface text-[16px] font-semibold">{activeTeam.name}</span>
        <ChevronDownIcon size={18} className="text-on-surface-variant" />
      </header>

      <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-2 pt-3">
        <button
          type="button"
          onClick={() => navigate({ to: '/issue' })}
          aria-current={section === 'issue' ? 'true' : undefined}
          className={`flex h-11 items-center gap-3 rounded-xl px-3 transition-colors ${
            section === 'issue'
              ? 'bg-surface-container text-on-surface'
              : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface'
          }`}
        >
          <FolderIcon size={18} />
          <span className="typography-label-small">이슈 보드</span>
        </button>

        {activeTeam.groups.map((g) => (
          <div key={g.name} className="flex flex-col gap-[2px]">
            <div className="flex h-6 items-center justify-between pr-1 pl-2">
              <div className="flex items-center gap-1">
                <ChevronDownIcon size={12} className="text-on-surface-variant" />
                <span className="text-on-surface-variant text-[12px] font-semibold tracking-[0.5px]">
                  {g.name}
                </span>
              </div>
              <button
                type="button"
                aria-label={`${g.name}에 채널 추가`}
                onClick={() => setGroup(g.name)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <PlusIcon size={16} />
              </button>
            </div>
            {g.channels.map((channel) => (
              <ChannelListItem
                key={channel.id}
                name={channel.name}
                prefix={channel.voice ? '🔊' : <HashIcon size={18} />}
                unreadCount={channel.unread}
                active={section === 'chat' && channel.id === activeChannel?.id}
                onClick={() => {
                  selectChannel(channel.id);
                  navigate({ to: '/chat' });
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate({ to: '/profile' })}
        className="bg-surface-container flex h-14 shrink-0 items-center gap-2 px-2 text-left"
      >
        <Avatar name="준" tone="blue" size={32} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-on-surface truncate text-[14px] font-semibold">junjuny</span>
          <span className="text-on-surface-variant text-[12px]">온라인</span>
        </span>
        <SettingsIcon size={20} className="text-on-surface-variant" />
      </button>

      <Modal
        open={group != null}
        onClose={() => setGroup(null)}
        title={`${group ?? ''} · 채널 만들기`}
        footer={
          <>
            <Button variant="weak" color="neutral" onClick={() => setGroup(null)}>
              취소
            </Button>
            <Button onClick={submit} disabled={!name.trim()}>
              만들기
            </Button>
          </>
        }
      >
        <TextField
          label="채널 이름"
          placeholder="예: 공지사항"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && submit()}
        />
        <label className="flex items-center justify-between py-1">
          <span className="typography-label-small text-on-surface">음성 채널</span>
          <Switch checked={voice} onCheckedChange={setVoice} />
        </label>
      </Modal>
    </aside>
  );
}

export function AppLayout({ children }: { children?: ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="bg-background text-on-surface flex h-screen overflow-hidden font-sans">
        <TeamRail />
        <ChannelSidebar />
        <main className="h-full min-w-0 flex-1">{children ?? <Outlet />}</main>
      </div>
    </WorkspaceProvider>
  );
}
