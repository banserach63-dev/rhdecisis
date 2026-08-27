"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, X, ChevronLeft, ChevronRight } from "lucide-react";
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
        className={`fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-surface transition-[width,transform] duration-200 ease-in-out lg:sticky lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[76px]" : "lg:w-64"}`}
      >
        <button
          onClick={onToggleCollapse}
          className="absolute top-16 -right-3 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition-colors hover:text-primary lg:flex"
          aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
          title={collapsed ? "Développer le menu" : "Réduire le menu"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <div className={`flex items-center gap-2 border-b border-border px-5 py-4.5 ${collapsed ? "lg:justify-center lg:px-0" : "justify-between"}`}>
          <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold text-foreground">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-sm shadow-primary/30">
              <ClipboardList className="h-4.5 w-4.5" />
            </span>
            <span className={`leading-tight ${collapsed ? "lg:hidden" : ""}`}>
              <div className="text-[15px] font-semibold tracking-tight">SARH-AD</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted">Aide à la décision RH</div>
            </span>
          </Link>
          <button className={`text-muted lg:hidden ${collapsed ? "lg:hidden" : ""}`} onClick={onClose} aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-5 overflow-x-hidden overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label}>
              <div className={`px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider whitespace-nowrap text-muted/80 ${collapsed ? "lg:hidden" : ""}`}>
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
                          ? "bg-primary-soft text-primary"
                          : "text-foreground/75 hover:bg-surface-muted hover:text-foreground"
                      }`}
                    >
                      {active && <span className="absolute -left-3 top-1/2 h-4.5 w-1 -translate-y-1/2 rounded-full bg-primary" />}
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className={`border-t border-border px-5 py-3 text-[10px] whitespace-nowrap text-muted ${collapsed ? "lg:px-0 lg:text-center" : ""}`}>
          <span className={collapsed ? "lg:hidden" : ""}>SARH-AD · Usage interne · v1.0</span>
          <span className={`hidden ${collapsed ? "lg:inline" : ""}`}>v1.0</span>
        </div>
      </aside>
    </>
  );
}
