export interface CameraControl {
  enabled: boolean;
  /** 없으면 버튼을 비활성화한다 */
  onToggle?: () => void;
  /**
   * 권한이 없어 켤 수 없는 상태. 키보드·터치로도 이유를 알 수 있게 버튼은
   * 비활성화하지 않고, 누르면 onToggle에서 안내를 띄운다
   */
  unavailable?: boolean;
}
