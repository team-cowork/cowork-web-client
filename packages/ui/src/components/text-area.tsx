import { forwardRef, type TextareaHTMLAttributes, useId } from 'react';

import { cn } from '../lib/cn';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={textareaId} className="typography-label-small text-on-surface">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className={cn(
            'bg-surface text-on-surface typography-body-medium placeholder:text-on-surface-variant focus:ring-primary/50 min-h-[120px] w-full resize-y rounded-xl border px-3.5 py-3 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40',
            error ? 'border-error focus:ring-error/50' : 'border-outline focus:border-primary',
          )}
          {...props}
        />
        {error && <p className="typography-subtext-medium text-error">{error}</p>}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';
