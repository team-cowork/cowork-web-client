export interface CameraControl {
  enabled: boolean;
  /** 없으면 버튼을 비활성화한다 */
  onToggle?: () => void;
  /** 쓸 수 없을 때 버튼에 띄울 안내 */
  unavailableLabel?: string;
}
