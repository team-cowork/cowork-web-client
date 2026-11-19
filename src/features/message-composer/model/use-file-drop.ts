'use client';

import { type DragEvent, useRef, useState } from 'react';

/**
 * 영역에 파일을 끌어다 놓으면 첨부한다. 반환한 핸들러를 드롭 영역 요소에 펼쳐 넣는다.
 * 화면 안에서 끄는 것(이미지·텍스트 등)은 파일 첨부로 보지 않는다.
 * `onDropFiles`가 없으면 드롭을 받지 않으므로 핸들러도 돌려주지 않는다.
 */
export function useFileDrop(onDropFiles?: (files: File[]) => void) {
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const internalDrag = useRef(false);

  if (!onDropFiles) return { dragging: false, dropHandlers: {} };

  const acceptsDrop = (event: DragEvent) =>
    !internalDrag.current && event.dataTransfer.types.includes('Files');

  const dropHandlers = {
    onDragStart: () => {
      internalDrag.current = true;
    },
    onDragEnd: () => {
      internalDrag.current = false;
    },
    onDragEnter: (event: DragEvent) => {
      if (!acceptsDrop(event)) return;
      dragDepth.current += 1;
      setDragging(true);
    },
    onDragOver: (event: DragEvent) => {
      if (!acceptsDrop(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    onDragLeave: (event: DragEvent) => {
      if (!acceptsDrop(event)) return;
      dragDepth.current -= 1;
      if (dragDepth.current <= 0) {
        dragDepth.current = 0;
        setDragging(false);
      }
    },
    onDrop: (event: DragEvent) => {
      dragDepth.current = 0;
      setDragging(false);
      const accepted = acceptsDrop(event);
      internalDrag.current = false;
      if (!accepted) return;
      event.preventDefault();
      const files = Array.from(event.dataTransfer.items)
        .filter(
          (item) =>
            item.kind === 'file' && !item.webkitGetAsEntry()?.isDirectory,
        )
        .map((item) => item.getAsFile())
        .filter((file) => file !== null);
      if (files.length > 0) onDropFiles(files);
    },
  };

  return { dragging, dropHandlers };
}
