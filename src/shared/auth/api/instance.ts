import { Agent } from "https";

import axios from "axios";

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // TLS 우회: auth 서버(Spring)가 self-signed 인증서를 써서 개발 환경에서만 인증서 검증을 끈다.
  // production은 정상 검증. 백엔드에 정상 CA 인증서가 적용되면 제거할 임시 코드.
  ...(process.env.NODE_ENV !== "production"
    ? { httpsAgent: new Agent({ rejectUnauthorized: false }) }
    : {}),
});
