import { cn } from '../lib/cn';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, name, size = 40, className }: AvatarProps) {
  const initials = name ? name.trim().slice(0, 2).toUpperCase() : '';

  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        'bg-surface-variant text-on-surface-variant typography-label-medium inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        className,
      )}
    >
      {src ? <img src={src} alt={name ?? ''} className="size-full object-cover" /> : initials}
    </span>
  );
}
