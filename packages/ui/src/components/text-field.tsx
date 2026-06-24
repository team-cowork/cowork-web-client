import { forwardRef, type InputHTMLAttributes, useId } from 'react';

import { cn } from '../lib/cn';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, label, error, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {label && (
          <label htmlFor={inputId} className="typography-label-x-small text-on-surface-variant">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className={cn(
            'bg-surface text-on-surface typography-subtext-large placeholder:text-on-surface-variant focus:ring-primary/50 h-12 w-full rounded-xl border px-4 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40',
            error ? 'border-error focus:ring-error/50' : 'border-outline focus:border-primary',
          )}
          {...props}
        />
        {error && <p className="typography-subtext-medium text-error">{error}</p>}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
