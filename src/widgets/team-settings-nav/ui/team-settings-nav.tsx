'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/shared/lib/cn';
import {
  teamSettingsInvitesPath,
  teamSettingsProfilePath,
} from '@/shared/model/paths';

interface SettingsNavSection {
  label: string;
  href: string;
}

export interface TeamSettingsNavProps {
  teamId: number;
  teamName: string;
  className?: string;
}

export function TeamSettingsNav({
  teamId,
  teamName,
  className,
}: TeamSettingsNavProps) {
  const pathname = usePathname();
  const sections: SettingsNavSection[] = [
    { label: '프로필', href: teamSettingsProfilePath(teamId) },
    { label: '초대 링크', href: teamSettingsInvitesPath(teamId) },
  ];

  return (
    <nav
      aria-label="팀 설정"
      className={cn(
        'flex w-60 shrink-0 flex-col bg-surface-container-low px-3 py-6',
        className,
      )}
    >
      <h1 className="truncate px-2.5 pb-4 typography-label-small text-on-surface">
        {teamName}
      </h1>
      <ul className="flex flex-col gap-0.5">
        {sections.map((section) => {
          const active = pathname === section.href;

          return (
            <li key={section.href}>
              <Link
                href={section.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-9 items-center rounded-lg px-2.5 typography-label-small transition-colors',
                  active
                    ? 'bg-surface-container text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface',
                )}
              >
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
