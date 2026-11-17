'use client';

// TODO(임시): 서버 이슈·PR 목록이 열린 것만 주고 닫히거나 머지된 것은 안 줘서, 이 브라우저가
// 전에 목록에서 본 항목이 지금 목록에서 사라졌으면 끝난 것으로 본다. 다른 브라우저·기기와는
// 공유되지 않고, 삭제·이전된 항목도 끝난 것처럼 보일 수 있다. 서버가 끝난 항목을 주면(`state`
// 쿼리 등) 이 파일을 지운다.
import { useEffect, useState } from 'react';

/** 한 목록에서 기억해 둘 항목 수. */
const MAX_KNOWN = 200;

interface Numbered {
  number: number;
}

function read<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // 저장소를 못 쓰면 끝난 항목을 기억하지 못할 뿐이다.
  }
}

/** 기억해 둔 [known] 에 지금 목록 [current] 를 합친다. 바뀐 게 없으면 [known] 그대로다. */
function mergeKnown<T extends Numbered>(known: T[], current: T[]): T[] {
  const byNumber = new Map(known.map((item) => [item.number, item]));
  const changed = current.some(
    (item) =>
      JSON.stringify(byNumber.get(item.number)) !== JSON.stringify(item),
  );
  if (!changed) return known;

  const currentNumbers = new Set(current.map((item) => item.number));
  const vanished = known.filter((item) => !currentNumbers.has(item.number));

  return [...current, ...vanished].slice(0, MAX_KNOWN);
}

/** [current] 에서 사라진, 전에 본 항목. [storageKey] 별로 이 브라우저에 기억한다. */
export function useVanishedItems<T extends Numbered>(
  storageKey: string,
  current: T[],
): T[] {
  const [known, setKnown] = useState<T[]>(() => read<T>(storageKey));
  const merged = mergeKnown(known, current);

  // 렌더 중에 상태를 맞춘다. 바뀐 게 없으면 같은 값이라 한 번으로 끝난다.
  if (merged !== known) setKnown(merged);

  useEffect(() => write(storageKey, known), [storageKey, known]);

  const currentNumbers = new Set(current.map((item) => item.number));

  return merged.filter((item) => !currentNumbers.has(item.number));
}
