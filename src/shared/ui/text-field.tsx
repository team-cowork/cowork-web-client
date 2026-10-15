'use client';

import { type InputHTMLAttributes, type Ref, useId } from 'react';

import { cn } from '@/shared/lib/cn';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function TextField({
  className,
  label,
  error,
  id,
  disabled,
  ref,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="typography-label-x-small text-on-surface-variant"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'h-12 w-full rounded-xl border bg-surface px-4 typography-subtext-large text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40',
          error
            ? 'border-error focus:ring-error/50'
            : 'border-outline focus:border-primary',
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
