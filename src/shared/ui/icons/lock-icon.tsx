import { Icon, type IconProps } from "@/shared/ui/icons/icon";

export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x={5} y={11} width={14} height={10} rx={2} />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
);
