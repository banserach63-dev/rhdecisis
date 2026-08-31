import Link from "next/link";
import {
  Users,
  Repeat,
  CalendarOff,
  GraduationCap,
  BellRing,
  UserPlus,
  UserMinus,
  Wallet,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  Info,
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

type Trend = "up" | "down" | "flat";

/** Build a trend label + sentiment colour. `favorable` says which direction is good. */
function trendFrom(delta: number, unit: string, favorable: "up" | "down"): { trend: Trend; trendLabel: string } {
  if (!Number.isFinite(delta) || Math.abs(delta) < 0.05) {
    return { trend: "flat", trendLabel: `stable ${unit}` };
  }
  const arrow = delta > 0 ? "▲" : "▼";
  const good = (delta > 0 && favorable === "up") || (delta < 0 && favorable === "down");
  return {
    trend: good ? "up" : "down",
    trendLabel: `${arrow} ${formatNumber(Math.abs(delta), 1)} ${unit} vs an dernier`,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const profile = await requireProfile();
  const sp = await searchParams;
  const supabase = await createClient();
  const today = new Date();
  const year = today.getFullYear();
  const todayStr = today.toISOString().slice(0, 10);
  const monthStart = `${year}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

  // Période issue des filtres globaux
  const periode = sp.periode ?? "";
  const periodeEnd = periode === "prev" ? `${year - 1}-12-31` : todayStr;
  const yearStart =
    periode === "12m"
      ? new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toISOString().slice(0, 10)
      : periode === "prev"
        ? `${year - 1}-01-01`
        : `${year}-01-01`;
  const prevYearStart = `${year - 1}-01-01`;
  const prevYearSameDay = `${year - 1}${todayStr.slice(4)}`;

  const fDirection = sp.direction ?? "";
  const fService = sp.service ?? "";
  const fStatut = sp.statut ?? "";
  const filtreActif = Boolean(fDirection || fService || fStatut || periode);

  let agentsQuery = supabase
    .from("agents")
    .select("id, sexe, date_naissance, date_recrutement, direction_id, service_id, statut_id, actif")
    .eq("actif", true);
  if (fDirection) agentsQuery = agentsQuery.eq("direction_id", fDirection);
  if (fService) agentsQuery = agentsQuery.eq("service_id", fService);
  if (fStatut) agentsQuery = agentsQuery.eq("statut_id", fStatut);

  const [
    agentsRes,
    directionsRes,
    recrutementsRes,
    departsRes,
    turnoverRes,
    turnoverPrevRes,
    absenteismeRes,
    absenteismePrevRes,
    formationsRes,
    formationsPrevRes,
    alertesRes,
    masseSalarialeRes,
  ] = await Promise.all([
    agentsQuery,
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
    supabase.rpc("kpi_turnover", { p_date_debut: yearStart, p_date_fin: periodeEnd }),
    supabase.rpc("kpi_turnover", { p_date_debut: prevYearStart, p_date_fin: prevYearSameDay }),
    supabase.rpc("kpi_absenteisme", { p_date_debut: yearStart, p_date_fin: periodeEnd }),
    supabase.rpc("kpi_absenteisme", { p_date_debut: prevYearStart, p_date_fin: prevYearSameDay }),
    supabase.from("formations").select("id, statut").gte("date_debut", yearStart),
    supabase.from("formations").select("id").gte("date_debut", prevYearStart).lte("date_debut", prevYearSameDay),
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
  const plus50 = agents.filter((a) => ageFromDate(a.date_naissance) >= 50).length;
  const plus50Pct = effectifTotal ? (plus50 / effectifTotal) * 100 : 0;

  const recrutements = recrutementsRes.data?.length ?? 0;
  const departs = departsRes.data?.length ?? 0;
  const turnover = (turnoverRes.data as number) ?? 0;
  const turnoverPrev = (turnoverPrevRes.data as number) ?? 0;
  const absenteisme = (absenteismeRes.data as number) ?? 0;
  const absenteismePrev = (absenteismePrevRes.data as number) ?? 0;
  const formationsCount = formationsRes.data?.length ?? 0;
  const formationsPrev = formationsPrevRes.data?.length ?? 0;
  const masseSalariale = (masseSalarialeRes.data as number) ?? 0;

  const alertesList = alertesRes.data ?? [];
  const alertesActives = alertesList.filter((a) => a.statut !== "traitee" && a.statut !== "ignoree");
  const alerteCounts = { critique: 0, importante: 0, qualite: 0, information: 0 };
  alertesActives.forEach((a) => {
    alerteCounts[a.niveau as keyof typeof alerteCounts]++;
  });

  // Évolution des effectifs (12 derniers mois)
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
  const effectifDebut = effectifEvolution[0]?.effectif ?? effectifTotal;
  const effectifFin = effectifEvolution[effectifEvolution.length - 1]?.effectif ?? effectifTotal;
  const effectif12mDelta = effectifFin - effectifDebut;
  const effectif12mPct = effectifDebut ? (effectif12mDelta / effectifDebut) * 100 : 0;

  // Répartition par direction
  const dirCount = new Map<string, number>();
  agents.forEach((a) => a.direction_id && dirCount.set(a.direction_id, (dirCount.get(a.direction_id) ?? 0) + 1));
  const repartitionDirection = directions
    .map((d) => ({ direction: d.nom, effectif: dirCount.get(d.id) ?? 0 }))
    .sort((a, b) => b.effectif - a.effectif);
  const topDirection = repartitionDirection[0];

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

  const turnoverT = trendFrom(turnover - turnoverPrev, "pt", "down");
  const absTrend = trendFrom(absenteisme - absenteismePrev, "pt", "down");

  // Bloc « À retenir »
  const aRetenir: string[] = [];
  if (effectif12mDelta !== 0) {
    aRetenir.push(
      `L'effectif ${effectif12mDelta > 0 ? "a augmenté" : "a diminué"} de ${formatNumber(Math.abs(effectif12mPct), 1)} % sur 12 mois (${effectifDebut} → ${effectifFin} agents).`
    );
  }
  if (Math.abs(turnover - turnoverPrev) >= 0.1) {
    aRetenir.push(
      `Le turnover ${turnover < turnoverPrev ? "diminue" : "augmente"} de ${formatNumber(Math.abs(turnover - turnoverPrev), 1)} point vs l'an dernier (${formatPercent(turnover)}).`
    );
  }
  if (Math.abs(absenteisme - absenteismePrev) >= 0.1) {
    aRetenir.push(
      `L'absentéisme ${absenteisme < absenteismePrev ? "recule" : "progresse"} de ${formatNumber(Math.abs(absenteisme - absenteismePrev), 1)} point vs l'an dernier (${formatPercent(absenteisme)}).`
    );
  }
  if (plus50Pct >= 15) {
    aRetenir.push(
      `${formatNumber(plus50Pct, 0)} % des agents ont plus de 50 ans (${plus50} agents) — anticiper les départs.`
    );
  }
  if (alerteCounts.critique > 0) {
    aRetenir.push(`${alerteCounts.critique} alerte${alerteCounts.critique > 1 ? "s" : ""} critique${alerteCounts.critique > 1 ? "s" : ""} en attente de traitement.`);
  }
  if (topDirection && topDirection.effectif > 0) {
    aRetenir.push(`${topDirection.direction} concentre le plus gros effectif (${topDirection.effectif} agents).`);
  }
  if (aRetenir.length === 0) {
    aRetenir.push("Situation RH stable — aucun mouvement significatif détecté sur la période.");
  }

  const alerteBlocs = [
    { key: "critique", label: "critiques", tone: "danger" as const, dot: "🔴", icon: AlertTriangle, count: alerteCounts.critique },
    { key: "importante", label: "vigilance", tone: "warning" as const, dot: "🟠", icon: AlertCircle, count: alerteCounts.importante },
    { key: "information", label: "informations", tone: "default" as const, dot: "🟢", icon: Info, count: alerteCounts.information + alerteCounts.qualite },
  ];

  return (
    <div>
      <PageHeader
        title={`Bonjour ${profile.prenom} 👋`}
        description={`Situation RH au ${today.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} — indicateurs calculés à partir des données enregistrées.`}
      />

      {filtreActif && (
        <div className="mb-4 rounded-lg border border-accent/30 bg-accent-soft px-4 py-2 text-xs text-foreground">
          Vue filtrée : l&rsquo;effectif, la pyramide des âges et les répartitions sont restreints au périmètre choisi.
          Turnover, absentéisme, formations et masse salariale restent calculés à l&rsquo;échelle de l&rsquo;organisation.
        </div>
      )}

      {/* KPI de tête */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Effectif"
          value={formatNumber(effectifTotal)}
          icon={Users}
          tone="primary"
          trend={effectif12mDelta > 0 ? "up" : effectif12mDelta < 0 ? "down" : "flat"}
          trendLabel={`${effectif12mDelta >= 0 ? "▲" : "▼"} ${formatNumber(Math.abs(effectif12mPct), 1)} % sur 12 mois`}
        />
        <StatCard label="Turnover" value={formatPercent(turnover)} icon={Repeat} tone="warning" {...turnoverT} />
        <StatCard label="Absentéisme" value={formatPercent(absenteisme)} icon={CalendarOff} tone="warning" {...absTrend} />
        <StatCard
          label="Formations (année)"
          value={formatNumber(formationsCount)}
          icon={GraduationCap}
          tone="info"
          trend={formationsCount >= formationsPrev ? "up" : "down"}
          trendLabel={`${formationsCount >= formationsPrev ? "▲" : "▼"} ${formatNumber(Math.abs(formationsCount - formationsPrev))} vs an dernier`}
        />
        <StatCard
          label="Alertes actives"
          value={formatNumber(alertesActives.length)}
          icon={BellRing}
          tone="danger"
          trend={alerteCounts.critique > 0 ? "down" : "flat"}
          trendLabel={alerteCounts.critique > 0 ? `${alerteCounts.critique} critique${alerteCounts.critique > 1 ? "s" : ""} 🔴` : "aucune critique"}
        />
      </div>

      {/* Bloc « À retenir » + Alertes & actions */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" /> À retenir
              </span>
            }
            description="Synthèse automatique de la situation"
            action={
              <Link href="/kpi" className="flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                Voir les analyses <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <CardBody>
            <ul className="space-y-2.5">
              {aRetenir.map((point, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Alertes & actions"
            action={
              <Link href="/alertes" className="text-xs font-medium text-accent hover:underline">
                Tout voir
              </Link>
            }
          />
          <CardBody className="space-y-3">
            {alerteBlocs.map((b) => (
              <div key={b.key} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span aria-hidden>{b.dot}</span>
                    {b.count} {b.label}
                  </span>
                  <Link
                    href={b.key === "information" ? "/alertes" : `/alertes?niveau=${b.key}`}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    {b.key === "critique" ? "Analyser" : "Voir"}
                  </Link>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Indicateurs secondaires */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Répartition F / H" value={`${formatNumber(femmes)} / ${formatNumber(hommes)}`} icon={Users} tone="info" />
        <StatCard label="Âge moyen" value={`${formatNumber(ageMoyen, 1)} ans`} icon={Users} tone="info" />
        <StatCard label="Ancienneté moyenne" value={`${formatNumber(ancienneteMoyenne, 1)} ans`} icon={Users} tone="info" />
        <StatCard label="Recrutements (année)" value={formatNumber(recrutements)} icon={UserPlus} tone="success" />
        <StatCard label="Départs (année)" value={formatNumber(departs)} icon={UserMinus} tone="danger" />
        <StatCard label="Masse salariale (mois)" value={formatCurrency(masseSalariale)} icon={Wallet} tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Évolution des effectifs" description="12 derniers mois" />
          <CardBody>
            <div className="mb-3 flex items-baseline gap-3">
              <span className="text-2xl font-semibold tracking-tight text-foreground">{formatNumber(effectifFin)} agents</span>
              <span className={`text-sm font-medium ${effectif12mDelta >= 0 ? "text-success" : "text-danger"}`}>
                {effectif12mDelta >= 0 ? "+" : ""}
                {formatNumber(effectif12mPct, 1)} % sur 12 mois
              </span>
            </div>
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
          <CardHeader title="Pyramide des âges" description={`${formatNumber(plus50Pct, 0)} % des agents ont plus de 50 ans`} />
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
