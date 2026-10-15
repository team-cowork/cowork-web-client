import { Icon, type IconProps } from '@/shared/ui/icons/icon';

export const GlobeIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx={12} cy={12} r={9} />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
  </Icon>
);
