"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { NavGroup } from "@/lib/nav";
import type { Profile } from "@/lib/database.types";

export function AppShell({
  groups,
  profile,
  alertesNonLues,
  children,
}: {
  groups: NavGroup[];
  profile: Profile;
  alertesNonLues: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar groups={groups} open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Topbar profile={profile} alertesNonLues={alertesNonLues} onMenu={() => setOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
