import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { MouvementForm } from "@/components/mouvements/mouvement-form";
import { ArrowLeftRight, UserPlus, UserMinus } from "lucide-react";
import { formatDate, formatPercent } from "@/lib/format";

export default async function MouvementsPage() {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service");
  const supabase = await createClient();
  const canWrite = ["admin", "drh", "responsable_rh"].includes(profile.role);
  const today = new Date();
  const yearStart = `${today.getFullYear()}-01-01`;
  const todayStr = today.toISOString().slice(0, 10);

  const [mouvementsRes, agentsRes, typesRes, directionsRes, servicesRes, gradesRes, turnoverRes] = await Promise.all([
    supabase
      .from("mouvements")
      .select("*, agents(nom, prenom, matricule), types_mouvement(nom, sens), directions:direction_destination_id(nom), services:service_destination_id(nom)")
      .order("date_effet", { ascending: false })
      .limit(100),
    supabase.from("agents").select("id, nom, prenom, matricule").eq("actif", true).order("nom"),
    supabase.from("types_mouvement").select("id, nom").eq("actif", true).order("nom"),
    supabase.from("directions").select("id, nom").eq("actif", true).order("nom"),
    supabase.from("services").select("id, nom").eq("actif", true).order("nom"),
    supabase.from("grades").select("id, nom").eq("actif", true).order("nom"),
    supabase.rpc("kpi_turnover", { p_date_debut: yearStart, p_date_fin: todayStr }),
  ]);

  const mouvements = mouvementsRes.data ?? [];
  const entrees = mouvements.filter((m) => m.types_mouvement?.sens === "entree").length;
  const sorties = mouvements.filter((m) => m.types_mouvement?.sens === "sortie").length;

  return (
    <div>
      <PageHeader
        title="Mouvements du personnel"
        description="Recrutements, départs, mutations, affectations, détachements, disponibilités, promotions."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <StatCard label="Mouvements enregistrés" value={String(mouvements.length)} icon={ArrowLeftRight} />
        <StatCard label="Entrées (liste)" value={String(entrees)} icon={UserPlus} tone="success" />
        <StatCard label="Sorties (liste)" value={String(sorties)} icon={UserMinus} tone="danger" />
        <StatCard label="Turnover (année)" value={formatPercent((turnoverRes.data as number) ?? 0)} icon={ArrowLeftRight} tone="warning" />
      </div>

      {canWrite && (
        <Card className="mb-6">
          <CardHeader title="Enregistrer un mouvement" description="Mutation, promotion, détachement, disponibilité, changement de grade, départ…" />
          <CardBody>
            <MouvementForm
              agents={agentsRes.data?.map((a) => ({ id: a.id, label: `${a.matricule} — ${a.prenom} ${a.nom}` })) ?? []}
              types={typesRes.data?.map((t) => ({ id: t.id, label: t.nom })) ?? []}
              directions={directionsRes.data?.map((d) => ({ id: d.id, label: d.nom })) ?? []}
              services={servicesRes.data?.map((s) => ({ id: s.id, label: s.nom })) ?? []}
              grades={gradesRes.data?.map((g) => ({ id: g.id, label: g.nom })) ?? []}
            />
          </CardBody>
        </Card>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date d&apos;effet</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Motif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mouvements.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Aucun mouvement enregistré.
                </td>
              </tr>
            )}
            {mouvements.map((m) => (
              <tr key={m.id} className="hover:bg-surface-muted/60">
                <td className="px-4 py-3 font-medium">
                  {m.agents ? `${m.agents.prenom} ${m.agents.nom}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={m.types_mouvement?.sens === "entree" ? "success" : m.types_mouvement?.sens === "sortie" ? "danger" : "info"}>
                    {m.types_mouvement?.nom ?? "—"}
                  </Badge>
                </td>
                <td className="px-4 py-3">{formatDate(m.date_effet)}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {[m.directions?.nom, m.services?.nom].filter(Boolean).join(" · ") || "—"}
                </td>
                <td className="px-4 py-3 text-xs text-muted">{m.motif ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
