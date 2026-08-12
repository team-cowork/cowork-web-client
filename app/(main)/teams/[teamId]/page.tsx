import { EmptyState } from "@/shared/ui/empty-state";
import { ChatIcon } from "@/shared/ui/icons/chat-icon";

export default function TeamPage() {
  return (
    <div className="bg-background flex flex-1 items-center justify-center p-6">
      <EmptyState
        icon={<ChatIcon />}
        title="채널을 선택하세요"
        description="왼쪽 목록에서 채널을 골라 대화를 확인할 수 있습니다"
        className="max-w-md"
      />
    </div>
  );
}
