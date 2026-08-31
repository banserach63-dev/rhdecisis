"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, BellRing, LogOut, ChevronDown, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS } from "@/lib/roles";
import type { Profile } from "@/lib/database.types";

export function Topbar({
  profile,
  alertesNonLues,
  onMenu,
}: {
  profile: Profile;
  alertesNonLues: number;
  onMenu: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/agents?q=${encodeURIComponent(term)}`);
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-4 shadow-[0_1px_0_0_rgba(15,30,60,0.03)] backdrop-blur lg:px-6">
      <div className="flex flex-1 items-center gap-3">
        <button className="text-muted lg:hidden" onClick={onMenu} aria-label="Ouvrir le menu">
          <Menu className="h-5 w-5" />
        </button>
        <form onSubmit={submitSearch} className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un agent, un matricule…"
            className="w-full rounded-lg border border-border bg-surface-muted py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:bg-surface focus:outline-none"
          />
        </form>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/alertes"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-muted"
          aria-label="Alertes"
        >
          <BellRing className="h-4.5 w-4.5" />
          {alertesNonLues > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {alertesNonLues > 99 ? "99+" : alertesNonLues}
            </span>
          )}
        </Link>
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-muted"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs font-semibold text-primary-foreground">
              {profile.prenom.charAt(0)}
              {profile.nom.charAt(0)}
            </span>
            <span className="hidden text-left sm:block">
              <div className="text-xs font-medium text-foreground">
                {profile.prenom} {profile.nom}
              </div>
              <div className="text-[11px] text-muted">{ROLE_LABELS[profile.role]}</div>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-border bg-surface py-1 shadow-lg">
                <div className="border-b border-border px-3 py-2 text-xs text-muted">{profile.email}</div>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
                >
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
