import { cn } from '@/shared/lib/cn';

export interface SearchHighlightProps {
  /** 검색어가 `<em>…</em>`으로 감싸진 본문 조각 */
  snippet: string;
  className?: string;
}

/**
 * 검색 결과 조각에서 `<em>` 부분만 강조한다.
 * HTML로 해석하지 않고 글자로만 그려, 본문에 섞인 태그가 실행되지 않게 한다.
 */
export function SearchHighlight({ snippet, className }: SearchHighlightProps) {
  const parts = snippet.split(/<\/?em>/);

  return (
    <p className={cn('break-words', className)}>
      {parts.map((part, index) =>
        // 여는 태그와 닫는 태그 사이(홀수 번째)가 검색어에 걸린 부분이다.
        index % 2 === 1 ? (
          <mark
            key={index}
            className="rounded-[3px] bg-primary/15 px-0.5 text-on-surface"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </p>
  );
}
