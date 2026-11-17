'use client';

import { TextField } from '@/shared/ui/text-field';

export interface ProfileBasicValues {
  nickname: string;
  description: string;
}

export interface ProfileBasicFieldsProps {
  values: ProfileBasicValues;
  onChange: (values: ProfileBasicValues) => void;
}

/** 닉네임·한 줄 소개 입력. 저장과 취소는 프로필 사진과 함께 바깥 폼에서 처리한다. */
export function ProfileBasicFields({
  values,
  onChange,
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
    </>
  );
}
