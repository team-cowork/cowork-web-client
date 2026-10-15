import { EmptyState } from '@/shared/ui/empty-state';
import { ChatIcon } from '@/shared/ui/icons/chat-icon';

export default function DmHome() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background p-6">
      <EmptyState
        icon={<ChatIcon />}
        title="대화를 선택하세요"
        description="왼쪽에서 대화를 고르거나 새 메시지를 시작할 수 있습니다"
        className="max-w-md"
      />
    </div>
  );
}
