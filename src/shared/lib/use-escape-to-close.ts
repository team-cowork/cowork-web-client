import { useEffect, useEffectEvent } from 'react';

// 열려 있는 순서대로 쌓아 두고 Esc는 가장 위에 열린 것만 닫는다.
// 수정 창 위에 프로필 팝오버나 반응 피커가 떠 있을 때 Esc 한 번에 둘 다 닫히지 않게 한다.
const openHandlers: (() => void)[] = [];

function handleKeyDown(event: KeyboardEvent) {
  // 한글 조합 중 Esc는 조합을 끝내는 키라 닫지 않는다.
  if (event.key !== 'Escape' || event.isComposing) return;

  openHandlers.at(-1)?.();
}

export function useEscapeToClose(open: boolean, close: () => void) {
  const onClose = useEffectEvent(close);

  useEffect(() => {
    if (!open) return;

    const handler = () => onClose();
    openHandlers.push(handler);
    if (openHandlers.length === 1) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      openHandlers.splice(openHandlers.indexOf(handler), 1);
      if (openHandlers.length === 0) {
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [open]);
}
