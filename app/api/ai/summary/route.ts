import { NextResponse } from 'next/server';

import {
  parseNoteSummary,
  type NoteSummaryRequest,
} from '@/features/note-ai-summary/model/note-summary';
import { serverInstance } from '@/shared/api/instance';
import { getHttpStatus } from '@/shared/api/http-error';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';
/** 한 번에 보내는 회의록 글자 수 상한. 모델의 입력 한도와 비용을 지킨다. */
const MAX_CONTENT_LENGTH = 12000;
/** 로그인 확인이 오래 걸리면 확인하지 못한 것으로 본다. */
const AUTH_CHECK_TIMEOUT_MS = 5000;
/** Groq 가 응답을 멈춰도 요청이 매달리지 않게 한다. */
const GROQ_TIMEOUT_MS = 30000;
/** 사용자(토큰)마다 이 시간 동안 보낼 수 있는 요청 수. */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const SYSTEM_PROMPT = `당신은 팀 회의록을 정리하는 도우미입니다.
회의록을 읽고 아래 JSON 만 출력하세요. 한국어로 쓰고, 회의록에 없는 내용은 지어내지 마세요.
{
  "summary": "회의 전체를 2~4문장으로 요약",
  "decisions": ["결정된 사항", "..."],
  "actionItems": [{ "title": "해야 할 일을 한 줄로", "body": "배경이나 담당·기한 등 회의록에 있는 세부 내용" }]
}
결정 사항이나 할 일이 없으면 빈 배열로 두세요.`;

type SignInCheck = 'signed-in' | 'unauthorized' | 'unavailable';

/**
 * 로그인한 사용자인지 서버 API 로 확인한다.
 * 토큰이 없거나 서버가 401·403 으로 거절하면 `unauthorized`, 서버가 느리거나 장애면
 * `unavailable` 이다. 둘을 나눠야 서버가 잠깐 느린 것만으로 로그인이 풀리지 않는다.
 */
async function checkSignIn(authorization: string | null): Promise<SignInCheck> {
  if (!authorization) return 'unauthorized';
  try {
    await serverInstance.get('/user/users/me', {
      headers: { Authorization: authorization },
      timeout: AUTH_CHECK_TIMEOUT_MS,
    });
    return 'signed-in';
  } catch (error) {
    const status = getHttpStatus(error);
    return status === 401 || status === 403 ? 'unauthorized' : 'unavailable';
  }
}

// 이 프로세스 안에서만 세는 간단한 제한이다. 서버가 여러 대면 대수만큼 늘어난다.
const requestLog = new Map<string, number[]>();

/** [key] 사용자의 최근 요청 수를 세어 한도를 넘었으면 true. 넘지 않으면 이번 요청을 기록한다. */
function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (requestLog.get(key) ?? []).filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestLog.set(key, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

function badGateway(message: string) {
  return NextResponse.json({ message }, { status: 502 });
}

/**
 * 회의록 AI 요약. Groq 키는 서버 환경변수(`GROQ_API_KEY`)로만 읽고 브라우저로 내려가지 않는다.
 * 키가 없으면 기능이 꺼진 것으로 보고 404 를 준다.
 */
export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return new NextResponse(null, { status: 404 });

  const authorization = request.headers.get('authorization');
  const signIn = await checkSignIn(authorization);
  if (signIn === 'unauthorized') {
    return NextResponse.json(
      { message: '로그인이 필요합니다' },
      { status: 401 },
    );
  }
  if (signIn === 'unavailable') {
    return NextResponse.json(
      {
        message: '로그인 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요',
      },
      { status: 503 },
    );
  }

  if (isRateLimited(authorization ?? '')) {
    return NextResponse.json(
      { message: '요약 요청이 너무 많아요. 잠시 후 다시 시도해 주세요' },
      { status: 429 },
    );
  }

  let body: Partial<NoteSummaryRequest> | null;
  try {
    body = (await request.json()) as Partial<NoteSummaryRequest> | null;
  } catch {
    body = null;
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { message: '요청 형식이 올바르지 않아요' },
      { status: 400 },
    );
  }

  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (content === '') {
    return NextResponse.json(
      { message: '요약할 내용이 없어요' },
      { status: 400 },
    );
  }
  const truncated = content.length > MAX_CONTENT_LENGTH;

  let parsed: unknown = null;
  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `제목: ${title || '(없음)'}\n\n${content.slice(0, MAX_CONTENT_LENGTH)}`,
          },
        ],
      }),
    });
    if (!response.ok) return badGateway('AI 요약을 불러오지 못했어요');

    const result = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    parsed = JSON.parse(result.choices?.[0]?.message?.content ?? '');
  } catch {
    // 네트워크 실패, 시간 초과, JSON 이 아닌 응답은 모두 같은 502 로 알린다.
    return badGateway('AI 요약을 불러오지 못했어요');
  }

  const summary = parseNoteSummary(parsed);
  if (!summary) return badGateway('AI 응답을 읽지 못했어요');
  return NextResponse.json({ ...summary, truncated });
}
