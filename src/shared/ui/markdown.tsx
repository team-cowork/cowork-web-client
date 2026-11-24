import ReactMarkdown, { type Components } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import { cn } from '@/shared/lib/cn';

export type MarkdownVariant = 'chat' | 'document';

/**
 * 채팅 본문은 타인이 작성한 문자열이므로 레이아웃을 무너뜨리거나
 * 외부 리소스를 부르는 요소를 차단한다.
 */
const DISALLOWED_ELEMENTS: Record<MarkdownVariant, string[]> = {
  chat: ['img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'input'],
  document: ['input'],
};

/**
 * 마크다운 요소의 모양. 읽기 화면(`Markdown`)과 편집기(`MarkdownEditor`)가 함께 써서
 * 편집하는 동안과 게시한 뒤의 모습이 어긋나지 않게 한다.
 * Tailwind가 클래스를 찾을 수 있도록 선택자를 문자열 그대로 적는다.
 */
export const MARKDOWN_CLASS = cn(
  'break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
  '[&_p]:my-0.5',
  '[&_a]:text-primary [&_a]:hover:underline',
  '[&_strong]:font-semibold [&_em]:italic [&_del]:line-through [&_s]:line-through',
  '[&_code]:rounded-[4px] [&_code]:bg-surface-variant [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]',
  '[&_pre]:my-1 [&_pre]:overflow-x-auto [&_pre]:rounded-[8px] [&_pre]:bg-surface-variant [&_pre]:p-3 [&_pre]:typography-subtext-medium [&_pre]:font-mono',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[1em]',
  '[&_blockquote]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-outline-variant [&_blockquote]:pl-3 [&_blockquote]:text-on-surface-variant',
  '[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5',
  '[&_hr]:my-2 [&_hr]:border-outline-variant',
  '[&_table]:my-2 [&_table]:border-collapse [&_th]:border [&_th]:border-outline-variant [&_th]:bg-surface-variant [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_td]:border [&_td]:border-outline-variant [&_td]:px-2 [&_td]:py-1',
  '[&_img]:my-1 [&_img]:max-w-full [&_img]:rounded-[8px]',
);

/**
 * 제목은 본문보다 한 단계 이상 커야 제목으로 읽힌다.
 * h1~h3과 그 이하(h4~h6) 네 단계로 나눈다.
 */
export const MARKDOWN_HEADING_CLASS: Record<MarkdownVariant, string> = {
  chat: cn(
    '[&_h1]:mt-2 [&_h1]:mb-1 [&_h1]:typography-title-medium',
    '[&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:typography-title-small',
    '[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:typography-label-large',
    '[&_h4]:mt-2 [&_h4]:mb-1 [&_h4]:typography-label-medium',
    '[&_h5]:mt-2 [&_h5]:mb-1 [&_h5]:typography-label-medium',
    '[&_h6]:mt-2 [&_h6]:mb-1 [&_h6]:typography-label-medium',
  ),
  document: cn(
    '[&_h1]:mt-2 [&_h1]:mb-1 [&_h1]:typography-display-small',
    '[&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:typography-title-medium',
    '[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:typography-title-small',
    '[&_h4]:mt-2 [&_h4]:mb-1 [&_h4]:typography-label-large',
    '[&_h5]:mt-2 [&_h5]:mb-1 [&_h5]:typography-label-large',
    '[&_h6]:mt-2 [&_h6]:mb-1 [&_h6]:typography-label-large',
  ),
};

const COMPONENTS: Components = {
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export interface MarkdownProps {
  children: string;
  variant?: MarkdownVariant;
  className?: string;
}

/**
 * 마크다운 문자열을 React 노드로 렌더한다.
 * HTML 문자열을 거치지 않으므로 원문에 태그가 섞여 있어도 그대로 텍스트로 표시된다.
 */
export function Markdown({
  children,
  variant = 'chat',
  className,
}: MarkdownProps) {
  return (
    <div
      className={cn(MARKDOWN_CLASS, MARKDOWN_HEADING_CLASS[variant], className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        disallowedElements={DISALLOWED_ELEMENTS[variant]}
        unwrapDisallowed
        components={COMPONENTS}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
