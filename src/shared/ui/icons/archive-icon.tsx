import { Icon, type IconProps } from "@/shared/ui/icons/icon";

export const ArchiveIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x={3} y={4} width={18} height={5} rx={1} />
    <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" />
  </Icon>
);
