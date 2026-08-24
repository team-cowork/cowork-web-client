import { Icon, type IconProps } from '@/shared/ui/icons/icon';

export const MicIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x={9} y={3} width={6} height={11} rx={3} />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </Icon>
);
