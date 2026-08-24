"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, X } from "lucide-react";
import type { NavGroup } from "@/lib/nav";
import { ICON_MAP } from "@/components/layout/icon-map";

export function Sidebar({
  groups,
  open,
  onClose,
}: {
  groups: NavGroup[];
  open: boolean;
  onClose: () => void;
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
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardList className="h-4.5 w-4.5" />
            </span>
            <span className="leading-tight">
              SARH-AD
              <div className="text-[10px] font-normal text-muted">Aide à la décision RH</div>
            </span>
          </Link>
          <button className="text-muted lg:hidden" onClick={onClose} aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
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
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary-soft text-primary"
                          : "text-foreground/80 hover:bg-surface-muted hover:text-foreground"
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
