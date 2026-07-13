import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

export interface Channel {
  id: string;
  name: string;
  voice?: boolean;
  unread?: number;
  description?: string;
}

export interface ChannelGroup {
  name: string;
  channels: Channel[];
}

export interface Team {
  id: string;
  label: string;
  name: string;
  groups: ChannelGroup[];
}

// ponytail: 시연용 시드. 서버(팀)마다 채널셋이 달라야 전환이 눈에 보인다.
const SEED_TEAMS: Team[] = [
  {
    id: 'cowork',
    label: '코',
    name: '코웍',
    groups: [
      {
        name: '디자인',
        channels: [
          { id: 'general', name: '일반' },
          { id: 'notice', name: '공지사항', unread: 3 },
          { id: 'voice-meeting', name: '음성 회의', voice: true },
        ],
      },
      {
        name: '개발',
        channels: [
          { id: 'backend', name: '백엔드', description: '백엔드 API 개발 · PR/이슈 논의' },
          { id: 'frontend', name: '프론트엔드', description: '프론트엔드 · MFE · 디자인시스템' },
          { id: 'standup', name: '데일리 스크럼', voice: true },
        ],
      },
      {
        name: '프로젝트 미소속',
        channels: [{ id: 'smalltalk', name: '잡담', unread: 7 }],
      },
    ],
  },
  {
    id: 'design',
    label: '디',
    name: '디자인',
    groups: [
      {
        name: '일반',
        channels: [
          { id: 'd-notice', name: '공지', description: '디자인팀 공지 채널' },
          { id: 'd-resource', name: '리소스', unread: 2 },
        ],
      },
      {
        name: '디자인 시스템',
        channels: [
          { id: 'd-token', name: '토큰', description: '컬러 · 타이포 토큰 논의' },
          { id: 'd-component', name: '컴포넌트' },
        ],
      },
    ],
  },
  {
    id: 'gsm',
    label: 'GS',
    name: 'GSM',
    groups: [
      {
        name: '일반',
        channels: [
          { id: 'g-chat', name: '잡담' },
          { id: 'g-qna', name: '질문', unread: 5 },
        ],
      },
    ],
  },
];

const firstChannelId = (team: Team) => team.groups[0]?.channels[0]?.id ?? '';

interface WorkspaceValue {
  teams: Team[];
  activeTeam: Team;
  activeChannel: Channel | undefined;
  selectTeam: (id: string) => void;
  selectChannel: (id: string) => void;
  createTeam: (name: string) => void;
  createChannel: (groupName: string, name: string, voice: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(SEED_TEAMS);
  const [activeTeamId, setActiveTeamId] = useState('cowork');
  const [activeChannelId, setActiveChannelId] = useState('backend');

  const value = useMemo<WorkspaceValue>(() => {
    // 시드가 항상 1개 이상이라 teams[0]은 존재.
    const activeTeam = teams.find((t) => t.id === activeTeamId) ?? teams[0]!;
    const activeChannel = activeTeam.groups
      .flatMap((g) => g.channels)
      .find((c) => c.id === activeChannelId);

    return {
      teams,
      activeTeam,
      activeChannel,
      selectTeam: (id) => {
        const team = teams.find((t) => t.id === id);
        if (!team) return;
        setActiveTeamId(id);
        setActiveChannelId(firstChannelId(team));
      },
      selectChannel: (id) => {
        setActiveChannelId(id);
        // 선택 시 안 읽음 뱃지 제거
        setTeams((prev) =>
          prev.map((t) => ({
            ...t,
            groups: t.groups.map((g) => ({
              ...g,
              channels: g.channels.map((c) => (c.id === id ? { ...c, unread: undefined } : c)),
            })),
          })),
        );
      },
      createTeam: (name) => {
        const id = `team-${Date.now()}`;
        const channelId = `${id}-general`;
        const newTeam: Team = {
          id,
          label: name.trim().slice(0, 2),
          name: name.trim(),
          groups: [{ name: '일반', channels: [{ id: channelId, name: '일반' }] }],
        };
        setTeams((prev) => [...prev, newTeam]);
        setActiveTeamId(id);
        setActiveChannelId(channelId);
      },
      createChannel: (groupName, name, voice) => {
        // 모달 열린 채 팀 전환 시 그룹이 새 팀에 없으면 중단(activeChannel undefined 방지).
        const team = teams.find((t) => t.id === activeTeamId);
        if (!team || !team.groups.some((g) => g.name === groupName)) return;

        const id = `${activeTeamId}-${Date.now()}`;
        setTeams((prev) =>
          prev.map((t) =>
            t.id !== activeTeamId
              ? t
              : {
                  ...t,
                  groups: t.groups.map((g) =>
                    g.name !== groupName
                      ? g
                      : { ...g, channels: [...g.channels, { id, name: name.trim(), voice }] },
                  ),
                },
          ),
        );
        setActiveChannelId(id);
      },
    };
  }, [teams, activeTeamId, activeChannelId]);

  return <WorkspaceContext value={value}>{children}</WorkspaceContext>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
