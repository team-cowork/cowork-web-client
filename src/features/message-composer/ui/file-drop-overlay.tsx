/** 파일을 끌어 올렸을 때 드롭 영역 위에 띄우는 안내. 부모는 `relative`여야 한다. */
export function FileDropOverlay() {
  return (
    <div className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-[20px] border-2 border-dashed border-primary bg-surface/90 typography-subtext-large text-primary">
      여기에 놓으면 첨부돼요
    </div>
  );
}
