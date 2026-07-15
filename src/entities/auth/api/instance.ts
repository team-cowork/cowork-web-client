import axios from 'axios';

/** Cowork Authorization API(code↔verifier 교환·토큰 갱신·로그아웃) 전용 axios 인스턴스. */
export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
