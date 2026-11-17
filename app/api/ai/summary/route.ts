import { NextResponse } from 'next/server';

import {
  parseNoteSummary,
  type NoteSummaryRequest,
} from '@/features/note-ai-summary/model/note-summary';

// TODO(실험): 시연용이다. 배포하지 않는다. GROQ_API_KEY 가 없으면 아무것도 하지 않는다.
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';
/** 한 번에 보내는 회의록 글자 수 상한. 모델의 입력 한도와 비용을 지킨다. */
const MAX_CONTENT_LENGTH = 12000;

const SYSTEM_PROMPT = `당신은 팀 회의록을 정리하는 도우미입니다.
회의록을 읽고 아래 JSON 만 출력하세요. 한국어로 쓰고, 회의록에 없는 내용은 지어내지 마세요.
{
  "summary": "회의 전체를 2~4문장으로 요약",
  "decisions": ["결정된 사항", "..."],
  "actionItems": [{ "title": "해야 할 일을 한 줄로", "body": "배경이나 담당·기한 등 회의록에 있는 세부 내용" }]
}
결정 사항이나 할 일이 없으면 빈 배열로 두세요.`;

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return new NextResponse(null, { status: 404 });

  let body: Partial<NoteSummaryRequest>;
  try {
    body = (await request.json()) as Partial<NoteSummaryRequest>;
  } catch {
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

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
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

  if (!response.ok) {
    return NextResponse.json(
      { message: 'AI 요약을 불러오지 못했어요' },
      { status: 502 },
    );
  }

  const result = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(result.choices?.[0]?.message?.content ?? '');
  } catch {
    parsed = null;
  }

  const summary = parseNoteSummary(parsed);
  if (!summary) {
    return NextResponse.json(
      { message: 'AI 응답을 읽지 못했어요' },
      { status: 502 },
    );
  }
  return NextResponse.json(summary);
}
