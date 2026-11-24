'use client';

import { memo, useMemo } from 'react';

import { Placeholder } from '@tiptap/extensions';
import Image from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TableKit } from '@tiptap/extension-table';
import { Markdown as MarkdownExtension } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { cn } from '@/shared/lib/cn';
import { MARKDOWN_CLASS, MARKDOWN_HEADING_CLASS } from '@/shared/ui/markdown';

import './markdown-editor.css';

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
 *
 * 편집기는 문서 전체를 다시 마크다운으로 만들어 저장한다. 읽기 화면(`Markdown`)이 그리는
 * 문법(표·체크리스트·이미지)을 모두 등록해 두어야 기존 내용이 고칠 때 망가지지 않는다.
 */
export const MarkdownEditor = memo(function MarkdownEditor({
  defaultValue,
  onChange,
  placeholder,
  className,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
}: MarkdownEditorProps) {
  const attributes = useMemo(
    () => ({
      class: cn(
        'markdown-editor min-h-[1.5em] focus:outline-none',
        MARKDOWN_CLASS,
        MARKDOWN_HEADING_CLASS.document,
        className,
      ),
      role: 'textbox',
      'aria-multiline': 'true',
      ...(ariaLabel && { 'aria-label': ariaLabel }),
      ...(ariaInvalid && { 'aria-invalid': 'true' }),
      ...(ariaRequired && { 'aria-required': 'true' }),
    }),
    [className, ariaLabel, ariaInvalid, ariaRequired],
  );

  // deps 없이 쓰면 렌더할 때마다 최신 옵션(onUpdate 포함)이 편집기에 반영된다.
  const editor = useEditor({
    // 서버에서 그리면 하이드레이션이 어긋나므로 브라우저에서만 만든다.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
        // 밑줄은 `++글자++`로 저장되는데, 읽기 화면은 이 문법을 몰라 글자 그대로 보여 준다.
        underline: false,
      }),
      TableKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
      MarkdownExtension,
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    contentType: 'markdown',
    editorProps: { attributes },
    onUpdate: ({ editor: current }) =>
      onChange(current.isEmpty ? '' : current.getMarkdown()),
  });

  return <EditorContent editor={editor} />;
});
