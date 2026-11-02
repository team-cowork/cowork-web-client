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

type HeadingClasses = [h1: string, h2: string, h3: string, minor: string];

/**
 * 제목은 본문(채팅 15px)보다 한 단계 이상 커야 제목으로 읽힌다.
 * h1~h3과 그 이하(h4~h6) 네 단계로 나눈다.
 */
const HEADING_CLASS: Record<MarkdownVariant, HeadingClasses> = {
  chat: [
    'typography-title-medium',
    'typography-title-small',
    'typography-label-large',
    'typography-label-medium',
  ],
  document: [
    'typography-display-small',
    'typography-title-medium',
    'typography-title-small',
    'typography-label-large',
  ],
};

function createComponents(variant: MarkdownVariant): Components {
  const [h1Class, h2Class, h3Class, minorHeadingClass] = HEADING_CLASS[variant];

  return {
    p: ({ children }) => <p className="my-0.5">{children}</p>,
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    del: ({ children }) => <del className="line-through">{children}</del>,
    code: ({ children }) => (
      <code className="rounded-[4px] bg-surface-variant px-1.5 py-0.5 font-mono text-[0.9em]">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="my-1 overflow-x-auto rounded-[8px] bg-surface-variant p-3 typography-subtext-medium font-mono [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[1em]">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-1 border-l-4 border-outline-variant pl-3 text-on-surface-variant">
        {children}
      </blockquote>
    ),
    ul: ({ children }) => <ul className="my-1 list-disc pl-5">{children}</ul>,
    ol: ({ children }) => (
      <ol className="my-1 list-decimal pl-5">{children}</ol>
    ),
    li: ({ children }) => <li className="my-0.5">{children}</li>,
    hr: () => <hr className="my-2 border-outline-variant" />,
    h1: ({ children }) => (
      <h1 className={cn('mt-2 mb-1', h1Class)}>{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className={cn('mt-2 mb-1', h2Class)}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className={cn('mt-2 mb-1', h3Class)}>{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className={cn('mt-2 mb-1', minorHeadingClass)}>{children}</h4>
    ),
    h5: ({ children }) => (
      <h5 className={cn('mt-2 mb-1', minorHeadingClass)}>{children}</h5>
    ),
    h6: ({ children }) => (
      <h6 className={cn('mt-2 mb-1', minorHeadingClass)}>{children}</h6>
    ),
  };
}

const CHAT_COMPONENTS = createComponents('chat');
const DOCUMENT_COMPONENTS = createComponents('document');

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
      className={cn(
        'break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        disallowedElements={DISALLOWED_ELEMENTS[variant]}
        unwrapDisallowed
        components={variant === 'chat' ? CHAT_COMPONENTS : DOCUMENT_COMPONENTS}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
