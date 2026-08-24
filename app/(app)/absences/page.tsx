import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { AbsenceForm } from "@/components/absences/absence-form";
import { AbsenceStatusActions } from "@/components/absences/absence-status-actions";
import { SimpleBarChart } from "@/components/charts/charts";
import { CalendarOff, Clock, TrendingDown } from "lucide-react";
import { formatDate, formatNumber, formatPercent } from "@/lib/format";

export default async function AbsencesPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const isManager = ["admin", "drh", "responsable_rh", "chef_service"].includes(profile.role);
  const today = new Date();
  const yearStart = `${today.getFullYear()}-01-01`;
  const todayStr = today.toISOString().slice(0, 10);

  const [absencesRes, agentsRes, typesRes, absenteismeRes] = await Promise.all([
    supabase
      .from("absences")
      .select("*, agents(id, nom, prenom, matricule, service_id, services(nom)), types_absence(nom, remunere)")
      .order("date_debut", { ascending: false })
      .limit(150),
    supabase.from("agents").select("id, nom, prenom, matricule").eq("actif", true).order("nom"),
    supabase.from("types_absence").select("id, nom").eq("actif", true).order("nom"),
    supabase.rpc("kpi_absenteisme", { p_date_debut: yearStart, p_date_fin: todayStr }),
  ]);

  const absences = absencesRes.data ?? [];
  const totalJours = absences.reduce((s, a) => s + Number(a.nb_jours), 0);
  const dureeMoyenne = absences.length ? totalJours / absences.length : 0;
  const enAttente = absences.filter((a) => a.statut === "demandee").length;

  // Comparaison entre services (taux approx : jours d'absence / effectif du service)
  const parService = new Map<string, number>();
  absences
    .filter((a) => a.statut === "validee")
    .forEach((a) => {
      const nom = a.agents?.services?.nom ?? "Non affecté";
      parService.set(nom, (parService.get(nom) ?? 0) + Number(a.nb_jours));
    });
  const comparaisonServices = Array.from(parService.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Évolution mensuelle (6 derniers mois)
  const monthsBack = 6;
  const evolutionMensuelle = Array.from({ length: monthsBack }).map((_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (monthsBack - 1 - i), 1);
    const label = d.toLocaleDateString("fr-FR", { month: "short" });
    const jours = absences
      .filter((a) => {
        const debut = new Date(a.date_debut);
        return debut.getFullYear() === d.getFullYear() && debut.getMonth() === d.getMonth() && a.statut === "validee";
      })
      .reduce((s, a) => s + Number(a.nb_jours), 0);
    return { mois: label, jours };
  });

  const STATUT_TONE: Record<string, "success" | "danger" | "warning" | "default"> = {
    validee: "success",
    refusee: "danger",
    demandee: "warning",
    annulee: "default",
  };

  return (
    <div>
      <PageHeader
        title="Absences et congés"
        description="Suivi des absences, taux d'absentéisme et comparaison entre services."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <StatCard label="Absences (liste)" value={String(absences.length)} icon={CalendarOff} />
        <StatCard label="Jours d'absence" value={formatNumber(totalJours, 1)} icon={Clock} tone="warning" />
        <StatCard label="Durée moyenne" value={`${formatNumber(dureeMoyenne, 1)} j`} icon={Clock} />
        <StatCard label="Taux d'absentéisme (année)" value={formatPercent((absenteismeRes.data as number) ?? 0)} icon={TrendingDown} tone="danger" />
      </div>

      <Card className="mb-6">
        <CardHeader title={isManager ? "Enregistrer une absence" : "Déclarer une absence"} />
        <CardBody>
          <AbsenceForm
            agents={agentsRes.data?.map((a) => ({ id: a.id, label: `${a.matricule} — ${a.prenom} ${a.nom}` })) ?? []}
            types={typesRes.data?.map((t) => ({ id: t.id, label: t.nom })) ?? []}
            showAgentSelect={isManager}
          />
        </CardBody>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Évolution mensuelle (jours d'absence)" />
          <CardBody>
            <SimpleBarChart data={evolutionMensuelle} xKey="mois" series={[{ key: "jours", label: "Jours" }]} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Comparaison entre services" description="Jours d'absence cumulés" />
          <CardBody>
            <SimpleBarChart data={comparaisonServices} xKey="name" layout="vertical" series={[{ key: "value", label: "Jours" }]} height={Math.max(220, comparaisonServices.length * 30)} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Demandes et absences enregistrées" description={enAttente > 0 ? `${enAttente} en attente de validation` : undefined} />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Période</th>
                  <th className="px-4 py-3">Jours</th>
                  <th className="px-4 py-3">Statut</th>
                  {isManager && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {absences.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted">
                      Aucune absence enregistrée.
                    </td>
                  </tr>
                )}
                {absences.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-muted/60">
                    <td className="px-4 py-3 font-medium">{a.agents ? `${a.agents.prenom} ${a.agents.nom}` : "—"}</td>
                    <td className="px-4 py-3">{a.types_absence?.nom ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {formatDate(a.date_debut)} → {formatDate(a.date_fin)}
                    </td>
                    <td className="px-4 py-3">{formatNumber(a.nb_jours, 1)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUT_TONE[a.statut]}>{a.statut}</Badge>
                    </td>
                    {isManager && (
                      <td className="px-4 py-3 text-right">
                        {a.statut === "demandee" && <AbsenceStatusActions id={a.id} />}
                      </td>
                    )}
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
