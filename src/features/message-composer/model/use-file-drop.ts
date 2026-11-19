'use client';

import { type DragEvent, useEffect, useRef, useState } from 'react';

// 페이지 안에서 시작한 드래그인지. 드롭 영역이 여럿이어도 같은 기준으로 거르도록
// 영역마다 따로 두지 않고 문서 하나에서 기록한다. 다른 영역에서 끌어 온 이미지도 걸러진다.
let internalDrag = false;
let dragTrackingInstalled = false;

function installDragTracking() {
  if (dragTrackingInstalled) return;
  dragTrackingInstalled = true;

  document.addEventListener(
    'dragstart',
    () => {
      internalDrag = true;
    },
    true,
  );
  document.addEventListener(
    'dragend',
    () => {
      internalDrag = false;
    },
    true,
  );
}

/**
 * 영역에 파일을 끌어다 놓으면 첨부한다. 반환한 핸들러를 드롭 영역 요소에 펼쳐 넣는다.
 * 화면 안에서 끄는 것(이미지·텍스트 등)은 파일 첨부로 보지 않는다.
 * `onDropFiles`가 없으면 드롭을 받지 않으므로 핸들러도 돌려주지 않는다.
 */
export function useFileDrop(onDropFiles?: (files: File[]) => void) {
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  useEffect(installDragTracking, []);

  if (!onDropFiles) return { dragging: false, dropHandlers: {} };

  const acceptsDrop = (event: DragEvent) =>
    !internalDrag && event.dataTransfer.types.includes('Files');

  const dropHandlers = {
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
      // 끌던 요소가 드롭하면서 사라지면 dragend가 오지 않을 수 있어 여기서도 푼다.
      internalDrag = false;
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
