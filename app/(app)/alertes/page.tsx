import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { AlerteActions, GenerateAlertesButton } from "@/components/alertes/alerte-actions";
import { AlertTriangle, AlertCircle, ShieldCheck, Info } from "lucide-react";
import { formatDateTime } from "@/lib/format";

const NIVEAU_CONFIG = {
  critique: { tone: "danger" as const, icon: AlertTriangle, label: "Critique" },
  importante: { tone: "warning" as const, icon: AlertCircle, label: "Importante" },
  qualite: { tone: "info" as const, icon: ShieldCheck, label: "Qualité" },
  information: { tone: "default" as const, icon: Info, label: "Information" },
};

export default async function AlertesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service", "direction_generale");
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("alertes")
    .select("*, agents(nom, prenom), directions(nom), services(nom)")
    .order("created_at", { ascending: false })
    .limit(150);

  if (sp.niveau) query = query.eq("niveau", sp.niveau);
  if (sp.statut) query = query.eq("statut", sp.statut);

  const { data: alertes } = await query;
  const canManage = ["admin", "drh", "responsable_rh"].includes(profile.role);

  const counts = { critique: 0, importante: 0, qualite: 0, information: 0 };
  (alertes ?? []).forEach((a) => {
    if (a.statut !== "traitee" && a.statut !== "ignoree") counts[a.niveau as keyof typeof counts]++;
  });

  return (
    <div>
      <PageHeader
        title="Alertes"
        description="Alertes critiques, importantes, de qualité et informatives générées automatiquement."
        action={canManage ? <GenerateAlertesButton /> : undefined}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <StatCard label="Critiques" value={String(counts.critique)} icon={AlertTriangle} tone="danger" />
        <StatCard label="Importantes" value={String(counts.importante)} icon={AlertCircle} tone="warning" />
        <StatCard label="Qualité" value={String(counts.qualite)} icon={ShieldCheck} tone="info" />
        <StatCard label="Informations" value={String(counts.information)} icon={Info} tone="primary" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {["", "critique", "importante", "qualite", "information"].map((n) => (
          <Link
            key={n || "tous"}
            href={n ? `/alertes?niveau=${n}` : "/alertes"}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              (sp.niveau ?? "") === n ? "border-primary bg-primary-soft text-primary" : "border-border text-muted"
            }`}
          >
            {n ? NIVEAU_CONFIG[n as keyof typeof NIVEAU_CONFIG].label : "Toutes"}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {(alertes ?? []).length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
            Aucune alerte pour le moment.
          </div>
        )}
        {(alertes ?? []).map((a) => {
          const cfg = NIVEAU_CONFIG[a.niveau as keyof typeof NIVEAU_CONFIG];
          const Icon = cfg.icon;
          return (
            <div key={a.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.tone === "danger" ? "bg-danger-soft text-danger" : cfg.tone === "warning" ? "bg-warning-soft text-warning" : cfg.tone === "info" ? "bg-info-soft text-info" : "bg-surface-muted text-muted"}`}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{a.titre}</h3>
                  <Badge tone={cfg.tone}>{cfg.label}</Badge>
                  <Badge tone={a.statut === "traitee" ? "success" : a.statut === "ignoree" ? "default" : "warning"}>{a.statut}</Badge>
                </div>
                {a.description && <p className="mt-1 text-xs text-muted">{a.description}</p>}
                <p className="mt-1 text-xs text-muted">
                  {[a.agents ? `${a.agents.prenom} ${a.agents.nom}` : null, a.services?.nom, a.directions?.nom].filter(Boolean).join(" · ")}
                  {" · "}
                  {formatDateTime(a.created_at)}
                </p>
              </div>
              {canManage && <AlerteActions id={a.id} statut={a.statut} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
