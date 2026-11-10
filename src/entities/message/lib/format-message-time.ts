const WITHIN_DAY_LABEL = ['오늘', '어제'] as const;

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function toClock(date: Date): string {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * 메시지 작성 시각을 `14:20` 형태로 변환한다.
 * 스레드처럼 같은 날 대화가 이어지는 좁은 영역에서 사용한다.
 */
export function formatMessageClock(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) return '';

  return toClock(date);
}

/**
 * 메시지 작성 시각을 `오늘 14:20` 형태로 변환한다.
 * 이틀보다 오래된 메시지는 `8월 26일 14:20`으로 날짜를 함께 노출한다.
 */
export function formatMessageTime(createdAt: string, now = new Date()): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) return '';

  const dayDiff = Math.round(
    (startOfDay(now) - startOfDay(date)) / (24 * 60 * 60 * 1000),
  );
  const label = WITHIN_DAY_LABEL[dayDiff];

  if (label) return `${label} ${toClock(date)}`;

  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${toClock(date)}`;
}
