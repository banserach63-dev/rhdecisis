"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

export type FilterOption = { id: string; nom: string; direction_id?: string | null };

const STORAGE_KEY = "sarh-ad:global-filters";
const KEYS = ["periode", "direction", "service", "statut"] as const;
type Key = (typeof KEYS)[number];

/**
 * Barre de filtres globale : Période / Direction / Service / Statut.
 * Les valeurs sont écrites dans l'URL (searchParams) et mémorisées entre les
 * pages via localStorage. Chaque page analytique lit ces mêmes paramètres.
 */
export function GlobalFilters({
  directions,
  services,
  statuts,
}: {
  directions: FilterOption[];
  services: FilterOption[];
  statuts: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Réapplique les filtres mémorisés si l'URL n'en porte aucun.
  useEffect(() => {
    if (KEYS.some((k) => params.get(k))) return;
    let stored: Partial<Record<Key, string>> = {};
    try {
      stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return;
    }
    const entries = KEYS.filter((k) => stored[k]);
    if (entries.length === 0) return;
    const next = new URLSearchParams(params.toString());
    entries.forEach((k) => next.set(k, stored[k]!));
    router.replace(`${pathname}?${next.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function update(key: Key, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "direction") next.delete("service");

    const persist: Partial<Record<Key, string>> = {};
    KEYS.forEach((k) => {
      const v = k === key ? value : next.get(k);
      if (v) persist[k] = v;
    });
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
    } catch {
      // ignore
    }
    router.push(`${pathname}?${next.toString()}`);
  }

  const sel = "rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary";
  const dir = params.get("direction") ?? "";
  const visibleServices = dir ? services.filter((s) => s.direction_id === dir) : services;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-muted px-4 py-2 lg:px-6">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Filtres
      </span>
      <select className={sel} value={params.get("periode") ?? ""} onChange={(e) => update("periode", e.target.value)}>
        <option value="">Année en cours</option>
        <option value="12m">12 derniers mois</option>
        <option value="ytd">Depuis janvier</option>
        <option value="prev">Année précédente</option>
      </select>
      <select className={sel} value={dir} onChange={(e) => update("direction", e.target.value)}>
        <option value="">Toutes directions</option>
        {directions.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nom}
          </option>
        ))}
      </select>
      <select className={sel} value={params.get("service") ?? ""} onChange={(e) => update("service", e.target.value)}>
        <option value="">Tous services</option>
        {visibleServices.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nom}
          </option>
        ))}
      </select>
      <select className={sel} value={params.get("statut") ?? ""} onChange={(e) => update("statut", e.target.value)}>
        <option value="">Tous statuts</option>
        {statuts.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nom}
          </option>
        ))}
      </select>
      {KEYS.some((k) => params.get(k)) && (
        <button
          onClick={() => {
            try {
              window.localStorage.removeItem(STORAGE_KEY);
            } catch {
              // ignore
            }
            router.push(pathname);
          }}
          className="text-xs font-medium text-accent hover:underline"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}
