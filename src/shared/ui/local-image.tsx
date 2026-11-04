'use client';

import { useCallback } from 'react';

export interface LocalImageProps {
  file: Blob;
  alt: string;
  className?: string;
}

/**
 * 아직 서버에 없는 파일을 브라우저 안에서 바로 그린다.
 * 화면에 붙어 있는 동안만 object URL을 만들고, 사라지면 해제한다.
 */
export function LocalImage({ file, alt, className }: LocalImageProps) {
  const attach = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return;

      const url = URL.createObjectURL(file);
      img.src = url;
      return () => URL.revokeObjectURL(url);
    },
    [file],
  );

  // blob URL은 이미지 최적화 서버가 읽을 수 없어 next/image 대신 img를 쓴다.
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={attach} alt={alt} className={className} />;
}
