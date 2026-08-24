import { type ReactElement } from 'react';

import {
  type ChannelViewType,
  toChannelViewType,
} from '@/entities/channel/model/channel';
import { BellIcon } from '@/shared/ui/icons/bell-icon';
import { EditIcon } from '@/shared/ui/icons/edit-icon';
import { FolderIcon } from '@/shared/ui/icons/folder-icon';
import { HashIcon } from '@/shared/ui/icons/hash-icon';
import { HeadphonesIcon } from '@/shared/ui/icons/headphones-icon';
import { LockIcon } from '@/shared/ui/icons/lock-icon';
import { type IconProps } from '@/shared/ui/icons/icon';

const CHANNEL_VIEW_TYPE_ICON: Record<
  ChannelViewType,
  (props: IconProps) => ReactElement
> = {
  TEXT: HashIcon,
  VOICE: HeadphonesIcon,
  WEBHOOK: BellIcon,
  ACCOUNT_SHARE: LockIcon,
  FILE_SHARE: FolderIcon,
  MEETING_NOTE: EditIcon,
};

export interface ChannelIconProps extends IconProps {
  viewType: string;
}

export function ChannelIcon({ viewType, ...props }: ChannelIconProps) {
  const Component = CHANNEL_VIEW_TYPE_ICON[toChannelViewType(viewType)];

  return <Component {...props} />;
}
