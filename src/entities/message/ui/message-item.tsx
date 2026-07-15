import { type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { Avatar, type AvatarTone } from "@/shared/ui/avatar";

export interface MessageItemProps {
  author: string;
  timestamp: string;
  content: ReactNode;
  avatarSrc?: string;
  tone?: AvatarTone;
  className?: string;
}

export function MessageItem({
  author,
  timestamp,
  content,
  avatarSrc,
  tone,
  className,
}: MessageItemProps) {
  return (
    <div className={cn("flex gap-4 px-4 py-1", className)}>
      <Avatar
        src={avatarSrc}
        name={author}
        size={44}
        tone={tone}
        className="shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="typography-label-x-small text-on-surface-variant">
          {author} · {timestamp}
        </p>
        <div className="typography-subtext-large text-on-surface break-words">
          {content}
        </div>
      </div>
    </div>
  );
}
