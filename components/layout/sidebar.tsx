"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { NavGroup } from "@/lib/nav";
import { ICON_MAP } from "@/components/layout/icon-map";

export function Sidebar({
  groups,
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  groups: NavGroup[];
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        suppressHydrationWarning
        className={`fixed top-0 left-0 z-40 flex h-screen w-56 flex-col border-r border-sidebar-border bg-sidebar-bg shadow-[4px_0_24px_-8px_rgba(6,13,28,0.35)] transition-[width,transform] duration-200 ease-in-out lg:sticky lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[76px]" : "lg:w-56"}`}
      >
        <button
          onClick={onToggleCollapse}
          className="absolute top-16 -right-3 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-bg-elevated text-sidebar-muted shadow-sm transition-colors hover:text-sidebar-active-accent lg:flex"
          aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
          title={collapsed ? "Développer le menu" : "Réduire le menu"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <div className={`flex items-center gap-2 border-b border-sidebar-border bg-sidebar-bg-elevated px-5 py-4.5 ${collapsed ? "lg:justify-center lg:px-0" : "justify-between"}`}>
          <Link href="/dashboard" className="flex items-center font-semibold text-sidebar-foreground">
            <span className={`leading-tight ${collapsed ? "lg:hidden" : ""}`}>
              <div className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
                SARH<span className="text-sidebar-active-accent">-</span>AD
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-sidebar-muted">Aide à la décision RH</div>
            </span>
            <span className={`hidden text-[15px] font-semibold tracking-tight ${collapsed ? "lg:block" : ""}`}>
              SA<span className="text-sidebar-active-accent">.</span>
            </span>
          </Link>
          <button className={`text-sidebar-muted lg:hidden ${collapsed ? "lg:hidden" : ""}`} onClick={onClose} aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-5 overflow-x-hidden overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label}>
              <div className={`px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider whitespace-nowrap text-sidebar-muted/70 ${collapsed ? "lg:hidden" : ""}`}>
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.icon];
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                        collapsed ? "lg:justify-center lg:px-0" : ""
                      } ${
                        active
                          ? "bg-sidebar-active-bg text-sidebar-foreground"
                          : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
                      }`}
                    >
                      {active && (
                        <span className="absolute -left-3 top-1/2 h-4.5 w-1 -translate-y-1/2 rounded-full bg-sidebar-active-accent" />
                      )}
                      {Icon && (
                        <Icon
                          className={`h-4 w-4 shrink-0 ${active ? "text-sidebar-active-accent" : ""}`}
                        />
                      )}
                      <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className={`border-t border-sidebar-border px-5 py-3 text-[10px] whitespace-nowrap text-sidebar-muted ${collapsed ? "lg:px-0 lg:text-center" : ""}`}>
          <span className={collapsed ? "lg:hidden" : ""}>Des données fiables. Des décisions éclairées. · v1.0</span>
          <span className={`hidden ${collapsed ? "lg:inline" : ""}`}>v1.0</span>
        </div>
      </aside>
    </>
  );
}
