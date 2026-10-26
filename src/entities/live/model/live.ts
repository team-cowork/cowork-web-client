export interface LiveStatus {
  live: boolean;
  session_id?: string;
  host_user_id?: number;
  started_at?: string;
  viewer_count: number;
}

export interface LiveStartResponse {
  token: string;
  livekit_url: string;
  session_id: string;
  room_name: string;
}

export interface LiveJoinResponse extends LiveStartResponse {
  host_user_id: number;
}
