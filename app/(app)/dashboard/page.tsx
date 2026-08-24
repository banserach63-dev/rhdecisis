import {
  Users,
  UserPlus,
  UserMinus,
  Repeat,
  CalendarOff,
  GraduationCap,
  Wallet,
  BellRing,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { TrendLineChart, SimpleBarChart, SimplePieChart, AgePyramid } from "@/components/charts/charts";
import { formatCurrency, formatNumber, formatPercent, ageFromDate, ancienneteAnnees } from "@/lib/format";

function monthLabel(d: Date) {
  return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const today = new Date();
  const yearStart = `${today.getFullYear()}-01-01`;
  const todayStr = today.toISOString().slice(0, 10);
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

  const [
    agentsRes,
    directionsRes,
    recrutementsRes,
    departsRes,
    turnoverRes,
    absenteismeRes,
    formationsRes,
    alertesRes,
    masseSalarialeRes,
  ] = await Promise.all([
    supabase.from("agents").select("id, sexe, date_naissance, date_recrutement, direction_id, actif").eq("actif", true),
    supabase.from("directions").select("id, nom").eq("actif", true),
    supabase
      .from("mouvements")
      .select("id, date_effet, types_mouvement!inner(sens)")
      .eq("types_mouvement.sens", "entree")
      .gte("date_effet", yearStart),
    supabase
      .from("mouvements")
      .select("id, date_effet, types_mouvement!inner(sens)")
      .eq("types_mouvement.sens", "sortie")
      .gte("date_effet", yearStart),
    supabase.rpc("kpi_turnover", { p_date_debut: yearStart, p_date_fin: todayStr }),
    supabase.rpc("kpi_absenteisme", { p_date_debut: yearStart, p_date_fin: todayStr }),
    supabase.from("formations").select("id, statut").gte("date_debut", yearStart),
    supabase.from("alertes").select("id, niveau, statut"),
    supabase.rpc("kpi_masse_salariale", { p_periode_debut: monthStart, p_periode_fin: todayStr }),
  ]);

  const agents = agentsRes.data ?? [];
  const directions = directionsRes.data ?? [];
  const effectifTotal = agents.length;
  const hommes = agents.filter((a) => a.sexe === "M").length;
  const femmes = agents.filter((a) => a.sexe === "F").length;
  const ageMoyen = effectifTotal ? agents.reduce((s, a) => s + ageFromDate(a.date_naissance), 0) / effectifTotal : 0;
  const ancienneteMoyenne = effectifTotal
    ? agents.reduce((s, a) => s + ancienneteAnnees(a.date_recrutement), 0) / effectifTotal
    : 0;

  const recrutements = recrutementsRes.data?.length ?? 0;
  const departs = departsRes.data?.length ?? 0;
  const turnover = (turnoverRes.data as number) ?? 0;
  const absenteisme = (absenteismeRes.data as number) ?? 0;
  const formationsCount = formationsRes.data?.length ?? 0;
  const alertesNouvelles = alertesRes.data?.filter((a) => a.statut === "nouvelle").length ?? 0;
  const masseSalariale = (masseSalarialeRes.data as number) ?? 0;

  // Évolution des effectifs (12 derniers mois) via la fonction kpi_effectif
  const months = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { d, end };
  });
  const effectifEvolution = await Promise.all(
    months.map(async ({ d, end }) => {
      const { data } = await supabase.rpc("kpi_effectif", { p_date: end.toISOString().slice(0, 10) });
      return { mois: monthLabel(d), effectif: (data as number) ?? 0 };
    })
  );

  // Répartition par direction
  const dirCount = new Map<string, number>();
  agents.forEach((a) => a.direction_id && dirCount.set(a.direction_id, (dirCount.get(a.direction_id) ?? 0) + 1));
  const repartitionDirection = directions
    .map((d) => ({ direction: d.nom, effectif: dirCount.get(d.id) ?? 0 }))
    .sort((a, b) => b.effectif - a.effectif);

  // Pyramide des âges
  const brackets = [
    [18, 25], [26, 30], [31, 35], [36, 40], [41, 45], [46, 50], [51, 55], [56, 60], [61, 70],
  ];
  const pyramide = brackets.map(([min, max]) => {
    const inBracket = agents.filter((a) => {
      const age = ageFromDate(a.date_naissance);
      return age >= min && age <= max;
    });
    return {
      tranche: `${min}-${max}`,
      hommes: -inBracket.filter((a) => a.sexe === "M").length,
      femmes: inBracket.filter((a) => a.sexe === "F").length,
    };
  });

  const repartitionSexe = [
    { name: "Hommes", value: hommes },
    { name: "Femmes", value: femmes },
  ];

  const statutsFormation = ["planifiee", "en_cours", "terminee"].map((s) => ({
    name: s === "planifiee" ? "Planifiée" : s === "en_cours" ? "En cours" : "Terminée",
    value: formationsRes.data?.filter((f) => f.statut === s).length ?? 0,
  }));

  return (
    <div>
      <PageHeader
        title={`Bonjour ${profile.prenom} 👋`}
        description="Vue d'ensemble de la situation RH — indicateurs calculés à partir des données actuellement enregistrées."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Effectif total" value={formatNumber(effectifTotal)} icon={Users} tone="primary" />
        <StatCard
          label="Répartition F / H"
          value={`${formatNumber(femmes)} / ${formatNumber(hommes)}`}
          icon={Users}
          tone="info"
        />
        <StatCard label="Âge moyen" value={`${formatNumber(ageMoyen, 1)} ans`} icon={Users} tone="info" />
        <StatCard label="Ancienneté moyenne" value={`${formatNumber(ancienneteMoyenne, 1)} ans`} icon={Users} tone="info" />
        <StatCard label="Recrutements (année)" value={formatNumber(recrutements)} icon={UserPlus} tone="success" />
        <StatCard label="Départs (année)" value={formatNumber(departs)} icon={UserMinus} tone="danger" />
        <StatCard label="Turnover" value={formatPercent(turnover)} icon={Repeat} tone="warning" />
        <StatCard label="Absentéisme" value={formatPercent(absenteisme)} icon={CalendarOff} tone="warning" />
        <StatCard label="Formations (année)" value={formatNumber(formationsCount)} icon={GraduationCap} tone="primary" />
        <StatCard label="Masse salariale (mois)" value={formatCurrency(masseSalariale)} icon={Wallet} tone="success" />
        <StatCard label="Alertes actives" value={formatNumber(alertesNouvelles)} icon={BellRing} tone="danger" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Évolution des effectifs" description="12 derniers mois" />
          <CardBody>
            <TrendLineChart data={effectifEvolution} xKey="mois" series={[{ key: "effectif", label: "Effectif" }]} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Répartition femmes / hommes" />
          <CardBody>
            <SimplePieChart data={repartitionSexe} />
          </CardBody>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Pyramide des âges" />
          <CardBody>
            <AgePyramid data={pyramide} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Répartition par direction" />
          <CardBody>
            <SimpleBarChart
              data={repartitionDirection}
              xKey="direction"
              layout="vertical"
              series={[{ key: "effectif", label: "Effectif" }]}
              height={Math.max(220, repartitionDirection.length * 34)}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Formations" description="Répartition par statut" />
          <CardBody>
            <SimplePieChart data={statutsFormation} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
