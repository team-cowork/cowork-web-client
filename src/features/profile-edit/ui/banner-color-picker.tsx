'use client';

import {
  PROFILE_BANNER_COLORS,
  PROFILE_BANNER_LABEL,
  type ProfileBannerColor,
} from '@/entities/user/model/profile-banner';
import { profileBannerClass } from '@/entities/user/ui/profile-banner';
import { cn } from '@/shared/lib/cn';
import { CheckIcon } from '@/shared/ui/icons/check-icon';

const OPTIONS: { value: ProfileBannerColor | null; label: string }[] = [
  { value: null, label: '기본' },
  ...PROFILE_BANNER_COLORS.map((value) => ({
    value,
    label: PROFILE_BANNER_LABEL[value],
  })),
];

export interface BannerColorPickerProps {
  value: ProfileBannerColor | null;
  onChange: (value: ProfileBannerColor | null) => void;
  disabled?: boolean;
}

/** 프로필 카드 위쪽 배경 색상을 고른다. */
export function BannerColorPicker({
  value,
  onChange,
  disabled = false,
}: BannerColorPickerProps) {
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="pb-2 typography-label-small text-on-surface">
        배경 색상
      </legend>
      <div role="radiogroup" className="flex flex-wrap gap-2.5">
        {OPTIONS.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value ?? 'DEFAULT'}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              title={option.label}
              onClick={() => onChange(option.value)}
              className={cn(
                profileBannerClass(option.value),
                'flex h-9 w-14 cursor-pointer items-center justify-center rounded-lg text-white ring-offset-2 ring-offset-surface transition-shadow focus-visible:outline-none disabled:cursor-not-allowed',
                selected
                  ? 'ring-2 ring-on-surface'
                  : 'hover:ring-2 hover:ring-outline focus-visible:ring-2 focus-visible:ring-primary/50',
              )}
            >
              {selected && <CheckIcon size={18} />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
