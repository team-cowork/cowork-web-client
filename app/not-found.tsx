import Link from 'next/link';

import { EmptyState } from '@/shared/ui/empty-state';
import { SearchIcon } from '@/shared/ui/icons/search-icon';

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background p-6">
      <EmptyState
        icon={<SearchIcon />}
        title="페이지를 찾을 수 없습니다"
        description="주소가 잘못되었거나 접근할 수 없는 리소스입니다"
        className="max-w-md"
        action={
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-xl bg-primary px-4 typography-label-small text-on-primary"
          >
            홈으로 돌아가기
          </Link>
        }
      />
    </div>
  );
}
