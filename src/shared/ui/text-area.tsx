'use client';

import { type Ref, type TextareaHTMLAttributes, useId } from 'react';

import { cn } from '@/shared/lib/cn';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({ className, label, error, id, disabled, ref, ...props }: TextAreaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label htmlFor={textareaId} className="typography-label-x-small text-on-surface-variant">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'bg-surface text-on-surface typography-subtext-large placeholder:text-on-surface-variant focus:ring-primary/50 min-h-[124px] w-full resize-y rounded-[14px] border px-4 py-[14px] focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40',
          error ? 'border-error focus:ring-error/50' : 'border-outline focus:border-primary',
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="typography-subtext-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
