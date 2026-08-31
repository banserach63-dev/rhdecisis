import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { formatNumber, formatPercent, ageFromDate } from "@/lib/format";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}
function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

const SUJETS = [
  { value: "effectifs", label: "Effectifs" },
  { value: "absences", label: "Absentéisme" },
  { value: "formations", label: "Formation" },
  { value: "carrieres", label: "Pyramide des âges & carrières" },
];

export default async function AnalysePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireRole("admin", "drh", "direction_generale", "responsable_rh");
  const sp = await searchParams;
  const sujet = SUJETS.some((s) => s.value === sp.sujet) ? sp.sujet! : "effectifs";

  const supabase = await createClient();
  const today = new Date();
  const yearStart = fmt(new Date(today.getFullYear(), 0, 1));
  const todayStr = fmt(today);
  const y12 = fmt(new Date(today.getFullYear() - 1, today.getMonth(), 1));

  const [agentsRes, turnoverRes, absRes, tcfRes, qualiteRes, effNowRes, eff12Res, entreesRes, sortiesRes] =
    await Promise.all([
      supabase.from("agents").select("date_naissance, sexe, direction_id").eq("actif", true),
      supabase.rpc("kpi_turnover", { p_date_debut: yearStart, p_date_fin: todayStr }),
      supabase.rpc("kpi_absenteisme", { p_date_debut: yearStart, p_date_fin: todayStr }),
      supabase.rpc("kpi_taux_couverture_formation", { p_date_debut: yearStart, p_date_fin: todayStr }),
      supabase.from("quality_scans").select("score_global").order("date_scan", { ascending: false }).limit(1).maybeSingle(),
      supabase.rpc("kpi_effectif", { p_date: todayStr }),
      supabase.rpc("kpi_effectif", { p_date: y12 }),
      supabase.from("mouvements").select("id, types_mouvement!inner(sens)").eq("types_mouvement.sens", "entree").gte("date_effet", y12),
      supabase.from("mouvements").select("id, types_mouvement!inner(sens)").eq("types_mouvement.sens", "sortie").gte("date_effet", y12),
    ]);

  const agents = agentsRes.data ?? [];
  const effectif = agents.length;
  const turnover = (turnoverRes.data as number) ?? 0;
  const absenteisme = (absRes.data as number) ?? 0;
  const tcf = (tcfRes.data as number) ?? 0;
  const qualite = qualiteRes.data?.score_global ?? 0;
  const effNow = (effNowRes.data as number) ?? effectif;
  const eff12 = (eff12Res.data as number) ?? effNow;
  const croissance = eff12 ? ((effNow - eff12) / eff12) * 100 : 0;
  const plus50 = agents.filter((a) => ageFromDate(a.date_naissance) >= 50).length;
  const plus50Pct = effectif ? (plus50 / effectif) * 100 : 0;
  const entrees = entreesRes.data?.length ?? 0;
  const sorties = sortiesRes.data?.length ?? 0;

  // --- Score RH (méthode transparente, moyenne simple non pondérée) ---
  const sousScores = [
    {
      libelle: "Effectifs",
      score: clamp(100 - Math.max(0, Math.abs(croissance) - 4) * 3),
      methode: "100 si la variation d'effectif sur 12 mois reste dans ±4 %, −3 points par point d'écart au-delà.",
    },
    {
      libelle: "Absences",
      score: clamp(100 - Math.max(0, absenteisme - 3) * 8),
      methode: "100 si l'absentéisme ≤ 3 %, −8 points par point supplémentaire.",
    },
    {
      libelle: "Formation",
      score: clamp(tcf),
      methode: "Égal au taux de couverture formation de la période.",
    },
    {
      libelle: "Carrières",
      score: clamp(100 - Math.max(0, plus50Pct - 20) * 2),
      methode: "100 si moins de 20 % des agents ont plus de 50 ans, −2 points par point au-delà (risque de départs).",
    },
    {
      libelle: "Données",
      score: clamp(qualite),
      methode: "Dernier score global du scan de qualité des données.",
    },
  ];
  const scoreGlobal = Math.round(sousScores.reduce((s, x) => s + x.score, 0) / sousScores.length);

  // --- Analyse guidée ---
  let resultat: string[] = [];
  if (sujet === "effectifs") {
    resultat = [
      `L'effectif est passé de ${eff12} à ${effNow} agents sur 12 mois, soit ${croissance >= 0 ? "+" : ""}${formatNumber(croissance, 1)} %.`,
      `Sur la même période : ${entrees} entrée${entrees > 1 ? "s" : ""} et ${sorties} sortie${sorties > 1 ? "s" : ""}.`,
      `Turnover annuel : ${formatPercent(turnover)}.`,
    ];
  } else if (sujet === "absences") {
    resultat = [
      `Taux d'absentéisme sur l'année : ${formatPercent(absenteisme)}.`,
      absenteisme > 5
        ? "Ce niveau est élevé : une analyse par service est recommandée."
        : "Ce niveau reste maîtrisé.",
    ];
  } else if (sujet === "formations") {
    resultat = [
      `Taux de couverture formation : ${formatPercent(tcf)}.`,
      tcf < 60 ? "En deçà de la cible usuelle de 60–70 % : plan de formation à renforcer." : "Objectif de couverture atteint.",
    ];
  } else {
    resultat = [
      `${formatNumber(plus50Pct, 0)} % des agents ont plus de 50 ans (${plus50} sur ${effectif}).`,
      `À règlementation constante, ce sont autant de départs potentiels à anticiper dans les 5 à 10  prochaines années.`,
    ];
  }

  return (
    <div>
      <PageHeader
        title="Analyse RH"
        description="Score RH synthétique et analyses guidées à partir des données enregistrées."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Score RH */}
        <Card>
          <CardHeader title="Score RH" description="Moyenne simple des 5 dimensions" />
          <CardBody>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-semibold tracking-tight text-primary">{scoreGlobal}</span>
              <span className="text-lg text-muted">/ 100</span>
            </div>
            <ul className="mt-4 space-y-2">
              {sousScores.map((s) => (
                <li key={s.libelle} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{s.libelle}</span>
                  <span className="font-medium text-foreground">{Math.round(s.score)}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Analyse guidée */}
        <Card className="lg:col-span-2">
          <CardHeader title="Que souhaitez-vous analyser ?" />
          <CardBody>
            <form className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1.5 text-xs font-medium">
                Sujet
                <Select name="sujet" defaultValue={sujet}>
                  {SUJETS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </label>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Lancer l'analyse
              </button>
            </form>

            <div className="mt-5 rounded-lg border border-border bg-surface-muted p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Résultat</div>
              <ul className="mt-2 space-y-2">
                {resultat.map((r, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Méthode de calcul */}
      <Card className="mt-5">
        <CardHeader title="Méthode de calcul du Score RH" description="Transparente et paramétrable — à ajuster avec la DRH" />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4 font-medium">Dimension</th>
                  <th className="py-2 pr-4 font-medium">Score</th>
                  <th className="py-2 font-medium">Règle</th>
                </tr>
              </thead>
              <tbody>
                {sousScores.map((s) => (
                  <tr key={s.libelle} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-4 font-medium">{s.libelle}</td>
                    <td className="py-2 pr-4">{Math.round(s.score)}</td>
                    <td className="py-2 text-muted">{s.methode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">
            Score global = moyenne arithmétique des 5 dimensions (poids égaux). Aucun coefficient masqué.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
