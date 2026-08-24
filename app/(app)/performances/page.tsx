import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { EvaluationForm } from "@/components/performances/evaluation-form";
import { CampagneForm } from "@/components/performances/campagne-form";
import { SimpleBarChart } from "@/components/charts/charts";
import { Target, TrendingUp } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/format";

export default async function PerformancesPage() {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service", "direction_generale");
  const supabase = await createClient();
  const canEvaluate = ["admin", "drh", "responsable_rh", "chef_service"].includes(profile.role);
  const isAdminDrh = ["admin", "drh"].includes(profile.role);

  const [evaluationsRes, campagnesRes, agentsRes] = await Promise.all([
    supabase
      .from("evaluations")
      .select("*, agents(nom, prenom, services(nom)), campagnes_evaluation(nom)")
      .order("date_evaluation", { ascending: false })
      .limit(150),
    supabase.from("campagnes_evaluation").select("id, nom").order("created_at", { ascending: false }),
    supabase.from("agents").select("id, nom, prenom, matricule").eq("actif", true).order("nom"),
  ]);

  const evaluations = evaluationsRes.data ?? [];
  const noteMoyenne = evaluations.length
    ? evaluations.reduce((s, e) => s + Number(e.note_globale ?? 0), 0) / evaluations.filter((e) => e.note_globale != null).length
    : 0;
  const tauxMoyen = evaluations.length
    ? evaluations.reduce((s, e) => s + Number(e.taux_atteinte ?? 0), 0) / evaluations.filter((e) => e.taux_atteinte != null).length
    : 0;

  const parService = new Map<string, { total: number; n: number }>();
  evaluations.forEach((e) => {
    const nom = e.agents?.services?.nom ?? "Non affecté";
    const cur = parService.get(nom) ?? { total: 0, n: 0 };
    if (e.taux_atteinte != null) {
      cur.total += Number(e.taux_atteinte);
      cur.n += 1;
    }
    parService.set(nom, cur);
  });
  const parServiceData = Array.from(parService.entries())
    .map(([name, v]) => ({ name, value: v.n ? Math.round((v.total / v.n) * 10) / 10 : 0 }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <PageHeader
        title="Performances"
        description="Objectifs, évaluations et taux d'atteinte par agent, service ou périmètre autorisé."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Évaluations" value={String(evaluations.length)} icon={Target} />
        <StatCard label="Note moyenne (/20)" value={formatNumber(noteMoyenne, 1)} icon={Target} tone="info" />
        <StatCard label="Taux d'atteinte moyen" value={`${formatNumber(tauxMoyen, 1)} %`} icon={TrendingUp} tone="success" />
      </div>

      {isAdminDrh && (
        <Card className="mb-6">
          <CardHeader title="Campagnes d'évaluation" />
          <CardBody>
            <CampagneForm />
          </CardBody>
        </Card>
      )}

      {canEvaluate && (
        <Card className="mb-6">
          <CardHeader title="Enregistrer une évaluation" />
          <CardBody>
            <EvaluationForm
              agents={agentsRes.data?.map((a) => ({ id: a.id, label: `${a.matricule} — ${a.prenom} ${a.nom}` })) ?? []}
              campagnes={campagnesRes.data?.map((c) => ({ id: c.id, label: c.nom })) ?? []}
            />
          </CardBody>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader title="Taux d'atteinte moyen par service" />
        <CardBody>
          <SimpleBarChart data={parServiceData} xKey="name" layout="vertical" series={[{ key: "value", label: "% atteinte" }]} height={Math.max(220, parServiceData.length * 30)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Évaluations récentes" />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Campagne</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3">Taux d&apos;atteinte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {evaluations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted">
                      Aucune évaluation enregistrée.
                    </td>
                  </tr>
                )}
                {evaluations.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-medium">{e.agents ? `${e.agents.prenom} ${e.agents.nom}` : "—"}</td>
                    <td className="px-4 py-3 text-muted">{e.campagnes_evaluation?.nom ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDate(e.date_evaluation)}</td>
                    <td className="px-4 py-3">{e.note_globale != null ? formatNumber(e.note_globale, 1) : "—"}</td>
                    <td className="px-4 py-3">
                      {e.taux_atteinte != null ? (
                        <Badge tone={e.taux_atteinte >= 80 ? "success" : e.taux_atteinte >= 50 ? "warning" : "danger"}>
                          {formatNumber(e.taux_atteinte, 1)} %
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
