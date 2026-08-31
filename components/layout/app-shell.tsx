"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { GlobalFilters, type FilterOption } from "@/components/layout/global-filters";
import { FloatingAssistant } from "@/components/assistant/floating-assistant";
import type { NavGroup } from "@/lib/nav";
import type { Profile } from "@/lib/database.types";

const FILTERED_ROUTES = ["/dashboard", "/effectifs"];

const COLLAPSE_STORAGE_KEY = "sarh-ad:sidebar-collapsed";

export function AppShell({
  groups,
  profile,
  alertesNonLues,
  showAssistant,
  filterOptions,
  children,
}: {
  groups: NavGroup[];
  profile: Profile;
  alertesNonLues: number;
  showAssistant: boolean;
  filterOptions: { directions: FilterOption[]; services: FilterOption[]; statuts: FilterOption[] };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const showFilters = FILTERED_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        groups={groups}
        open={open}
        onClose={() => setOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <Topbar profile={profile} alertesNonLues={alertesNonLues} onMenu={() => setOpen(true)} />
        {showFilters && (
          <GlobalFilters
            directions={filterOptions.directions}
            services={filterOptions.services}
            statuts={filterOptions.statuts}
          />
        )}
        <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
      {showAssistant && <FloatingAssistant />}
    </div>
  );
}
