import { type ReactNode } from "react";

import { UserFooter } from "@/widgets/sidebar/ui/user-footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1">
      <aside className="bg-surface flex w-60 shrink-0 flex-col">
        <div className="flex-1" />
        <UserFooter />
      </aside>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
