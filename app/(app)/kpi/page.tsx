import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Input } from "@/components/ui/form";
import { SimpleBarChart } from "@/components/charts/charts";
import { Users, Repeat, CalendarOff, GraduationCap, Wallet, ShieldCheck } from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function KpiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireRole("admin", "drh", "direction_generale", "responsable_rh");
  const sp = await searchParams;
  const supabase = await createClient();

  const today = new Date();
  const dateFin = sp.date_fin || fmt(today);
  const dateDebut = sp.date_debut || fmt(new Date(today.getFullYear(), 0, 1));

  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  const dureeJours = Math.max(1, Math.round((fin.getTime() - debut.getTime()) / 86400000));
  const prevFin = new Date(debut.getTime() - 86400000);
  const prevDebut = new Date(prevFin.getTime() - dureeJours * 86400000);

  const [
    effectifRes,
    turnoverRes,
    absenteismeRes,
    masseSalarialeRes,
    tcfRes,
    qualiteRes,
    turnoverPrevRes,
    absenteismePrevRes,
    directionsRes,
    agentsRes,
  ] = await Promise.all([
    supabase.rpc("kpi_effectif", { p_date: dateFin }),
    supabase.rpc("kpi_turnover", { p_date_debut: dateDebut, p_date_fin: dateFin }),
    supabase.rpc("kpi_absenteisme", { p_date_debut: dateDebut, p_date_fin: dateFin }),
    supabase.rpc("kpi_masse_salariale", { p_periode_debut: dateDebut, p_periode_fin: dateFin }),
    supabase.rpc("kpi_taux_couverture_formation", { p_date_debut: dateDebut, p_date_fin: dateFin }),
    supabase.from("quality_scans").select("score_global").order("date_scan", { ascending: false }).limit(1).maybeSingle(),
    supabase.rpc("kpi_turnover", { p_date_debut: fmt(prevDebut), p_date_fin: fmt(prevFin) }),
    supabase.rpc("kpi_absenteisme", { p_date_debut: fmt(prevDebut), p_date_fin: fmt(prevFin) }),
    supabase.from("directions").select("id, nom").eq("actif", true).order("nom"),
    supabase.from("agents").select("direction_id").eq("actif", true),
  ]);

  const dirCount = new Map<string, number>();
  agentsRes.data?.forEach((a) => a.direction_id && dirCount.set(a.direction_id, (dirCount.get(a.direction_id) ?? 0) + 1));
  const effectifParDirection = (directionsRes.data ?? []).map((d) => ({ name: d.nom, value: dirCount.get(d.id) ?? 0 }));

  const turnover = (turnoverRes.data as number) ?? 0;
  const turnoverPrev = (turnoverPrevRes.data as number) ?? 0;
  const absenteisme = (absenteismeRes.data as number) ?? 0;
  const absenteismePrev = (absenteismePrevRes.data as number) ?? 0;

  function trend(cur: number, prev: number) {
    if (prev === 0) return undefined;
    const diff = cur - prev;
    return { trend: (diff <= 0 ? "up" : "down") as "up" | "down", label: `${diff >= 0 ? "+" : ""}${formatNumber(diff, 1)} pts vs période précédente` };
  }

  const turnoverTrend = trend(turnover, turnoverPrev);
  const absenteismeTrend = trend(absenteisme, absenteismePrev);

  return (
    <div>
      <PageHeader
        title="KPI RH"
        description="Indicateurs clés calculés à partir des données enregistrées, sur la période sélectionnée."
      />

      <form className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <label className="flex flex-col gap-1 text-xs font-medium">
          Du
          <Input type="date" name="date_debut" defaultValue={dateDebut} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium">
          Au
          <Input type="date" name="date_fin" defaultValue={dateFin} />
        </label>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Appliquer la période
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Effectif (fin de période)" value={formatNumber((effectifRes.data as number) ?? 0)} icon={Users} />
        <StatCard
          label="Turnover"
          value={formatPercent(turnover)}
          icon={Repeat}
          tone="warning"
          trend={turnoverTrend?.trend}
          trendLabel={turnoverTrend?.label}
        />
        <StatCard
          label="Absentéisme"
          value={formatPercent(absenteisme)}
          icon={CalendarOff}
          tone="warning"
          trend={absenteismeTrend?.trend}
          trendLabel={absenteismeTrend?.label}
        />
        <StatCard label="Taux de couverture formation" value={formatPercent((tcfRes.data as number) ?? 0)} icon={GraduationCap} tone="success" />
        <StatCard label="Masse salariale" value={formatCurrency((masseSalarialeRes.data as number) ?? 0)} icon={Wallet} tone="info" />
        <StatCard label="Score qualité des données" value={formatNumber(qualiteRes.data?.score_global ?? 0, 1)} icon={ShieldCheck} tone="primary" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Effectif par direction" description={`Situation au ${dateFin}`} />
        <CardBody>
          <SimpleBarChart data={effectifParDirection} xKey="name" layout="vertical" series={[{ key: "value", label: "Effectif" }]} height={Math.max(220, effectifParDirection.length * 32)} />
        </CardBody>
      </Card>
    </div>
  );
}
