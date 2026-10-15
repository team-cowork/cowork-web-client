import { Icon, type IconProps } from '@/shared/ui/icons/icon';

export const MonitorIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x={2} y={4} width={20} height={13} rx={2} />
    <path d="M8 21h8M12 17v4" />
  </Icon>
);
