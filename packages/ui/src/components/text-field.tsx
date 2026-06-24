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
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={inputId} className="typography-label-small text-on-surface">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className={cn(
            'bg-surface text-on-surface typography-body-medium placeholder:text-on-surface-variant focus:ring-primary/50 h-11 w-full rounded-xl border px-3.5 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40',
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
