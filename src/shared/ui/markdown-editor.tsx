'use client';

import { useEffect, useRef } from 'react';

import { Markdown as MarkdownExtension } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';

import { cn } from '@/shared/lib/cn';

import './markdown-editor.css';

/**
 * 읽기 화면의 `<Markdown variant="document">`와 같은 모양이 되도록 맞춘다.
 * 편집하는 동안과 게시한 뒤의 모습이 달라지지 않게 하려는 것이다.
 */
const CONTENT_CLASS = cn(
  'markdown-editor min-h-[1.5em] break-words focus:outline-none',
  '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
  '[&_p]:my-0.5',
  '[&_a]:text-primary [&_a]:underline',
  '[&_strong]:font-semibold [&_em]:italic [&_s]:line-through',
  '[&_code]:rounded-[4px] [&_code]:bg-surface-variant [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]',
  '[&_pre]:my-1 [&_pre]:overflow-x-auto [&_pre]:rounded-[8px] [&_pre]:bg-surface-variant [&_pre]:p-3 [&_pre]:font-mono [&_pre]:typography-subtext-medium',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[1em]',
  '[&_blockquote]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-outline-variant [&_blockquote]:pl-3 [&_blockquote]:text-on-surface-variant',
  '[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5',
  '[&_hr]:my-2 [&_hr]:border-outline-variant',
  '[&_h1]:mt-2 [&_h1]:mb-1 [&_h1]:typography-display-small',
  '[&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:typography-title-medium',
  '[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:typography-title-small',
  '[&_h4]:mt-2 [&_h4]:mb-1 [&_h4]:typography-label-large',
);

export interface MarkdownEditorProps {
  /** 처음 보여 줄 마크다운. 편집기가 만들어진 뒤에 바뀐 값은 반영하지 않는다. */
  defaultValue: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  className?: string;
}

/**
 * 노션처럼 쓰는 대로 바로 서식이 입혀지는 편집기.
 * `# `는 제목, `- `는 목록, `**굵게**`는 굵은 글씨가 되고, 값은 마크다운 문자열로 내보낸다.
 */
export function MarkdownEditor({
  defaultValue,
  onChange,
  placeholder,
  className,
  ...aria
}: MarkdownEditorProps) {
  // 편집기는 한 번만 만들므로 최신 onChange를 ref로 부른다.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    // 서버에서 그리면 하이드레이션이 어긋나므로 브라우저에서만 만든다.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
      }),
      MarkdownExtension,
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    contentType: 'markdown',
    editorProps: {
      attributes: {
        class: cn(CONTENT_CLASS, className),
        role: 'textbox',
        'aria-multiline': 'true',
        ...(aria['aria-label'] && { 'aria-label': aria['aria-label'] }),
        ...(aria['aria-invalid'] && { 'aria-invalid': 'true' }),
        ...(aria['aria-required'] && { 'aria-required': 'true' }),
      },
    },
    onUpdate: ({ editor: current }) => {
      onChangeRef.current(current.isEmpty ? '' : current.getMarkdown());
    },
  });

  return <EditorContent editor={editor} />;
}
