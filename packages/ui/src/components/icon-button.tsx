import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/cn';

const iconButton = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center transition-[opacity,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
  {
    variants: {
      size: {
        S: 'size-9 rounded-[10px] [&_svg]:size-4',
        M: 'size-11 rounded-xl [&_svg]:size-5',
        L: 'size-[52px] rounded-[14px] [&_svg]:size-6',
      },
      variant: {
        fill: 'bg-primary text-on-primary hover:opacity-90',
        border: 'border border-outline text-on-surface hover:bg-surface-variant',
        clear: 'text-on-surface hover:bg-surface-variant',
      },
    },
    defaultVariants: { size: 'M', variant: 'fill' },
  },
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButton> {
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size, variant, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(iconButton({ size, variant }), className)}
      {...props}
    />
  ),
);

IconButton.displayName = 'IconButton';
