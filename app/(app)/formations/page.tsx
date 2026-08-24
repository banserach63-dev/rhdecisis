import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { FormationForm } from "@/components/formations/formation-form";
import { GraduationCap, Wallet, Percent } from "lucide-react";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";

const STATUT_TONE: Record<string, "success" | "info" | "warning"> = {
  terminee: "success",
  en_cours: "info",
  planifiee: "warning",
};

export default async function FormationsPage() {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service", "direction_generale");
  const supabase = await createClient();
  const canWrite = ["admin", "drh", "responsable_rh"].includes(profile.role);
  const today = new Date();
  const yearStart = `${today.getFullYear()}-01-01`;
  const todayStr = today.toISOString().slice(0, 10);

  const [formationsRes, organismesRes, competencesRes, tcfRes] = await Promise.all([
    supabase
      .from("formations")
      .select("*, organismes_formation(nom), competences(nom), formation_participants(id)")
      .order("date_debut", { ascending: false }),
    supabase.from("organismes_formation").select("id, nom").eq("actif", true).order("nom"),
    supabase.from("competences").select("id, nom").eq("actif", true).order("nom"),
    supabase.rpc("kpi_taux_couverture_formation", { p_date_debut: yearStart, p_date_fin: todayStr }),
  ]);

  const formations = formationsRes.data ?? [];
  const coutTotal = formations.reduce((s, f) => s + Number(f.cout ?? 0), 0);
  const participantsTotal = formations.reduce((s, f) => s + (f.formation_participants?.length ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Formations"
        description="Suivi des actions de formation, participants, coûts et taux de couverture."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <StatCard label="Formations (année)" value={String(formations.length)} icon={GraduationCap} />
        <StatCard label="Participations" value={String(participantsTotal)} icon={GraduationCap} tone="info" />
        <StatCard label="Coût total" value={formatCurrency(coutTotal)} icon={Wallet} tone="warning" />
        <StatCard label="Taux de couverture" value={formatPercent((tcfRes.data as number) ?? 0)} icon={Percent} tone="success" />
      </div>

      {canWrite && (
        <Card className="mb-6">
          <CardHeader title="Planifier une formation" />
          <CardBody>
            <FormationForm
              organismes={organismesRes.data?.map((o) => ({ id: o.id, label: o.nom })) ?? []}
              competences={competencesRes.data?.map((c) => ({ id: c.id, label: c.nom })) ?? []}
            />
          </CardBody>
        </Card>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Formation</th>
              <th className="px-4 py-3">Organisme</th>
              <th className="px-4 py-3">Compétence</th>
              <th className="px-4 py-3">Période</th>
              <th className="px-4 py-3">Participants</th>
              <th className="px-4 py-3">Coût</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {formations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  Aucune formation planifiée.
                </td>
              </tr>
            )}
            {formations.map((f) => (
              <tr key={f.id} className="hover:bg-surface-muted/60">
                <td className="px-4 py-3">
                  <Link href={`/formations/${f.id}`} className="font-medium text-primary hover:underline">
                    {f.titre}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{f.organismes_formation?.nom ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{f.competences?.nom ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {formatDate(f.date_debut)} → {formatDate(f.date_fin)}
                </td>
                <td className="px-4 py-3">
                  {f.formation_participants?.length ?? 0}
                  {f.capacite ? ` / ${f.capacite}` : ""}
                </td>
                <td className="px-4 py-3">{formatCurrency(f.cout)}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUT_TONE[f.statut] ?? "info"}>{f.statut.replace("_", " ")}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
