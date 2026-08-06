import { getMe } from '@/entities/user/api/get-me';
import { ProfileCard } from '@/entities/user/ui/profile-card';
import { ErrorState } from '@/shared/ui/error-state';

export async function MyProfile() {
  const me = await getMe();

  return (
    <section className="bg-surface-container-high flex flex-1 flex-col">
      <header className="border-outline-variant flex h-12 shrink-0 items-center border-b px-5">
        <h1 className="text-on-surface text-[1rem] font-semibold">프로필</h1>
      </header>
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-8">
        {me ? (
          <ProfileCard user={me} className="w-[760px] max-w-full" />
        ) : (
          <ErrorState
            title="프로필을 불러오지 못했어요"
            description="잠시 후 다시 시도해 주세요."
            className="w-[760px] max-w-full"
          />
        )}
      </div>
    </section>
  );
}
