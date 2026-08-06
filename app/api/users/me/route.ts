import { NextResponse } from "next/server";

import { getMe } from "@/entities/user/api/get-me";

/** 액세스 토큰이 httpOnly 쿠키라 브라우저가 백엔드를 직접 호출할 수 없어 같은 오리진에서 중계한다. */
export async function GET() {
  const me = await getMe();

  if (!me) {
    return NextResponse.json({ message: "내 정보를 불러오지 못했습니다" }, { status: 401 });
  }

  return NextResponse.json(me);
}
