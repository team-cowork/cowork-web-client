import { Icon, type IconProps } from '@/shared/ui/icons/icon';

export const CameraIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x={2} y={6} width={14} height={12} rx={2} />
    <path d="m16 10.5 6-3.5v10l-6-3.5" />
  </Icon>
);
