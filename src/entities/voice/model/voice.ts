export interface VoiceParticipant {
  user_id: number;
  joined_at: string;
}

export interface VoiceParticipants {
  channel_id: number;
  room_name: string;
  participants: VoiceParticipant[];
}

export interface VoiceSession {
  session_id: string;
  channel_id: number;
  team_id: number;
  status: string;
  started_at: string;
  ended_at: string | null;
}

export interface VoiceJoinResponse {
  session_id: string;
  room_name: string;
  token: string;
  livekit_url: string;
}

export interface VoiceRoomParticipant {
  identity: string;
  userId: number | null;
  speaking: boolean;
  muted: boolean;
  isLocal: boolean;
}
