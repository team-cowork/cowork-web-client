'use client';

import { BannerColorPicker } from '@/features/profile-edit/ui/banner-color-picker';
import { type ProfileBannerColor } from '@/entities/user/model/profile-banner';
import { TextField } from '@/shared/ui/text-field';

export interface ProfileBasicValues {
  nickname: string;
  description: string;
  bannerColor: ProfileBannerColor | null;
}

export interface ProfileBasicFieldsProps {
  values: ProfileBasicValues;
  onChange: (values: ProfileBasicValues) => void;
  /** 서버가 배경 색상을 지원할 때만 색상 선택을 보여 준다. 그전에는 저장해도 값이 버려진다. */
  bannerSupported?: boolean;
  disabled?: boolean;
}

/** 닉네임·한 줄 소개·배경 색상 입력. 저장과 취소는 프로필 사진과 함께 바깥 폼에서 처리한다. */
export function ProfileBasicFields({
  values,
  onChange,
  bannerSupported = false,
  disabled = false,
}: ProfileBasicFieldsProps) {
  return (
    <>
      <TextField
        label="닉네임"
        value={values.nickname}
        onChange={(event) =>
          onChange({ ...values, nickname: event.target.value })
        }
        placeholder="닉네임을 입력하세요"
      />
      <TextField
        label="한 줄 소개"
        value={values.description}
        onChange={(event) =>
          onChange({ ...values, description: event.target.value })
        }
        placeholder="자신을 한 줄로 소개해 보세요"
      />
      {bannerSupported && (
        <BannerColorPicker
          value={values.bannerColor}
          onChange={(bannerColor) => onChange({ ...values, bannerColor })}
          disabled={disabled}
        />
      )}
    </>
  );
}
