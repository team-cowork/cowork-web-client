import { UserAvatar } from '@/entities/user/ui/user-avatar';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { type User } from '@/entities/user/model/user';

function buildChips(user: User): string[] {
  return [
    user.student_number && `학번 ${user.student_number}`,
    user.student_role,
    user.specialty,
    user.github_id && `GitHub @${user.github_id}`,
  ].filter((chip): chip is string => Boolean(chip));
}

function buildSubtitle(user: User): string {
  const handle = user.nickname ?? user.github_id;

  return [handle && `@${handle}`, user.description].filter(Boolean).join(' · ');
}

export interface ProfileCardProps {
  user: User;
  onEdit?: () => void;
  className?: string;
}

export function ProfileCard({ user, onEdit, className }: ProfileCardProps) {
  const chips = buildChips(user);
  const subtitle = buildSubtitle(user);

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <section className="bg-surface flex flex-col overflow-hidden rounded-2xl">
        <div className="from-cowork-red-500 to-cowork-blue-500 h-[120px] bg-gradient-to-r" />
        <div className="flex items-end justify-between gap-4 px-6 pt-4 pb-5">
          <div className="flex min-w-0 items-end gap-4">
            <span className="bg-surface shrink-0 rounded-full p-1">
              <UserAvatar user={user} size={88} ringClassName="ring-surface" loading="eager" />
            </span>
            <div className="flex min-w-0 flex-col gap-1.5 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="typography-title-medium text-on-surface">{user.name}</h2>
                {user.roles.map((role) => (
                  <Badge key={role} color="brand">
                    {role}
                  </Badge>
                ))}
                {user.major && <Badge color="green">{user.major}</Badge>}
              </div>
              {subtitle && (
                <p className="text-on-surface-variant truncate text-[0.875rem]">{subtitle}</p>
              )}
            </div>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="bg-surface-container text-on-surface-variant typography-label-small flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] px-3.5"
            >
              프로필 편집
            </button>
          )}
        </div>
      </section>
      {chips.length > 0 && (
        <div className="flex flex-wrap items-start gap-2.5">
          {chips.map((chip) => (
            <span
              key={chip}
              className="bg-surface-container-low text-on-surface-variant typography-subtext-medium flex items-center rounded-lg px-2.5 py-[5px] font-medium"
            >
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
