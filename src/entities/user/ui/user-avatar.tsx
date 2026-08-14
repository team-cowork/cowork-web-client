import {
  USER_STATUS_DOT_CLASS,
  USER_STATUS_LABEL,
  toUserStatus,
  type User,
} from "@/entities/user/model/user";
import { cn } from "@/shared/lib/cn";
import { Avatar } from "@/shared/ui/avatar";

export interface UserAvatarProps {
  user?: User;
  size?: number;
  ringClassName?: string;
  loading?: "eager" | "lazy";
  className?: string;
}

export function UserAvatar({
  user,
  size = 40,
  ringClassName = "ring-surface",
  loading,
  className,
}: UserAvatarProps) {
  const status = user ? toUserStatus(user.status) : null;
  const dotSize = Math.max(8, Math.round(size * 0.3));

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Avatar
        src={user?.profile_image_url ?? undefined}
        name={user?.name}
        size={size}
        shape="circle"
        loading={loading}
      />
      {status && (
        <span
          role="img"
          aria-label={USER_STATUS_LABEL[status]}
          style={{ width: dotSize, height: dotSize }}
          className={cn(
            "pointer-events-none absolute right-0 bottom-0 rounded-full ring-2",
            USER_STATUS_DOT_CLASS[status],
            ringClassName,
          )}
        />
      )}
    </span>
  );
}
