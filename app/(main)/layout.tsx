import { type ReactNode } from "react";

import { SidebarNav } from "@/widgets/sidebar/ui/sidebar-nav";
import { UserFooter } from "@/widgets/sidebar/ui/user-footer";
import { TeamRail } from "@/widgets/team-rail/ui/team-rail";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <TeamRail />
      <aside className="bg-surface flex w-60 shrink-0 flex-col">
        <SidebarNav />
        <UserFooter />
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
