import { Icon, type IconProps } from '@/shared/ui/icons/icon';

export const HeadphonesIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x={2} y={14} width={5} height={7} rx={2} />
    <rect x={17} y={14} width={5} height={7} rx={2} />
  </Icon>
);
