export const CHANNEL_TYPES = ["TEXT", "VOICE", "DM"] as const;

export type ChannelType = (typeof CHANNEL_TYPES)[number];

export const CHANNEL_VIEW_TYPES = [
  "TEXT",
  "VOICE",
  "WEBHOOK",
  "ACCOUNT_SHARE",
  "FILE_SHARE",
  "MEETING_NOTE",
] as const;

export type ChannelViewType = (typeof CHANNEL_VIEW_TYPES)[number];

export const CHANNEL_VIEW_TYPE_LABEL: Record<ChannelViewType, string> = {
  TEXT: "일반 채팅",
  VOICE: "음성",
  WEBHOOK: "GitHub 웹훅",
  ACCOUNT_SHARE: "계정 공유",
  FILE_SHARE: "파일",
  MEETING_NOTE: "회의록",
};

export const CHANNEL_VIEW_TYPE_DESCRIPTION: Record<ChannelViewType, string> = {
  TEXT: "텍스트·음성 대화",
  VOICE: "실시간 음성",
  WEBHOOK: "커밋·PR·이슈 이벤트",
  ACCOUNT_SHARE: "팀 공용 계정",
  FILE_SHARE: "업로드·아카이브",
  MEETING_NOTE: "회의 기록·템플릿",
};

export const CHANNEL_VIEW_TYPE_TO_TYPE: Record<
  ChannelViewType,
  Exclude<ChannelType, "DM">
> = {
  TEXT: "TEXT",
  VOICE: "VOICE",
  WEBHOOK: "TEXT",
  ACCOUNT_SHARE: "TEXT",
  FILE_SHARE: "TEXT",
  MEETING_NOTE: "TEXT",
};

export function toChannelViewType(viewType: string): ChannelViewType {
  return (
    CHANNEL_VIEW_TYPES.find((candidate) => candidate === viewType) ?? "TEXT"
  );
}

export interface Channel {
  id: number;
  teamId: number | null;
  projectId: number | null;
  name: string;
  type: string;
  viewType: string;
  description: string | null;
  isPrivate: boolean;
  position: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelMember {
  id: number;
  channelId: number;
  userId: number;
  joinedAt: string;
}

export interface OpenDmRequest {
  targetUserId: number;
}

export interface AddChannelMemberRequest {
  userId: number;
}

export interface CreateChannelRequest {
  teamId: number;
  name: string;
  type: string;
  viewType: string;
  isPrivate: boolean;
  description?: string | null;
}
