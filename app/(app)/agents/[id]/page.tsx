import { notFound } from "next/navigation";
import { Pencil, LogOut as LogOutIcon } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { AgentTabs } from "@/components/agents/agent-tabs";
import { HistoriqueForm } from "@/components/agents/historique-form";
import { DepartForm } from "@/components/agents/depart-form";
import { formatCurrency, formatDate, formatNumber, ageFromDate, ancienneteAnnees, initials } from "@/lib/format";

export default async function AgentFichePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: agent } = await supabase
    .from("agents")
    .select(
      "*, grades(nom), directions(nom), services(nom), statuts(nom), categories(nom), fonctions(nom)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!agent) notFound();

  const canManage = ["admin", "drh", "responsable_rh"].includes(profile.role);
  const canSeeRemuneration = ["admin", "drh"].includes(profile.role) || profile.agent_id === agent.id;

  const [historiqueRes, carriereRes, absencesRes, formationsRes, competencesRes, evaluationsRes, remunerationsRes, typesMouvementRes] =
    await Promise.all([
      supabase.from("agent_historique").select("*").eq("agent_id", id).order("date_effet", { ascending: false }),
      supabase.from("carriere_evenements").select("*, grades(nom), services(nom)").eq("agent_id", id).order("date_evenement", { ascending: false }),
      supabase.from("absences").select("*, types_absence(nom)").eq("agent_id", id).order("date_debut", { ascending: false }),
      supabase.from("formation_participants").select("*, formations(titre, date_debut, date_fin)").eq("agent_id", id),
      supabase.from("agent_competences").select("*, competences(nom, categorie)").eq("agent_id", id),
      supabase.from("evaluations").select("*, campagnes_evaluation(nom)").eq("agent_id", id).order("date_evaluation", { ascending: false }),
      canSeeRemuneration
        ? supabase.from("remunerations").select("*").eq("agent_id", id).order("periode", { ascending: false })
        : Promise.resolve({ data: [] }),
      supabase.from("types_mouvement").select("id, nom").eq("sens", "sortie"),
    ]);

  const direction = (agent as { directions?: { nom: string } | null }).directions;
  const service = (agent as { services?: { nom: string } | null }).services;
  const grade = (agent as { grades?: { nom: string } | null }).grades;
  const statut = (agent as { statuts?: { nom: string } | null }).statuts;
  const categorie = (agent as { categories?: { nom: string } | null }).categories;
  const fonction = (agent as { fonctions?: { nom: string } | null }).fonctions;

  const anciennete = ancienneteAnnees(agent.date_recrutement);
  const absencesJours = (absencesRes.data ?? [])
    .filter((a) => a.statut === "validee")
    .reduce((s, a) => s + (a.nb_jours ?? 0), 0);
  const formationsSuivies = (formationsRes.data ?? []).length;
  const derniereEval = (evaluationsRes.data ?? [])[0];
  const performance =
    derniereEval?.taux_atteinte != null
      ? `${formatNumber(derniereEval.taux_atteinte, 0)} %`
      : derniereEval?.note_globale != null
        ? `${formatNumber(derniereEval.note_globale, 1)}/20`
        : "—";

  const situation = [
    { label: "Ancienneté", value: `${anciennete} an${anciennete > 1 ? "s" : ""}` },
    { label: "Absences validées", value: `${formatNumber(absencesJours, 1)} j` },
    { label: "Formations", value: formatNumber(formationsSuivies) },
    { label: "Performance", value: performance },
  ];

  const carriereItems = (carriereRes.data ?? []).map((c) => ({
    date: c.date_evenement,
    title: c.type_evenement.replace(/_/g, " "),
    detail: c.description ?? [c.grades?.nom, c.services?.nom].filter(Boolean).join(" · "),
  }));

  return (
    <div>
      <PageHeader
        title={`${agent.prenom} ${agent.nom}`}
        description={`Matricule ${agent.matricule}`}
        action={
          canManage ? (
            <LinkButton href={`/agents/${agent.id}/modifier`} size="sm" variant="secondary">
              <Pencil className="h-4 w-4" /> Modifier
            </LinkButton>
          ) : undefined
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {situation.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="text-xs font-medium text-muted">{s.label}</div>
            <div className="mt-1 text-xl font-semibold tracking-tight text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
              {initials(agent.prenom, agent.nom)}
            </span>
            <h2 className="mt-3 text-base font-semibold">
              {agent.prenom} {agent.nom}
            </h2>
            <p className="text-xs text-muted">{fonction?.nom ?? "Fonction non renseignée"}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              <Badge tone={agent.actif ? "success" : "default"}>{agent.actif ? "En activité" : "Sorti"}</Badge>
              <Badge tone="primary">{grade?.nom ?? "Grade —"}</Badge>
              {statut?.nom && <Badge>{statut.nom}</Badge>}
            </div>
            <dl className="mt-5 w-full space-y-2 text-left text-sm">
              <Row label="Direction" value={direction?.nom ?? "—"} />
              <Row label="Service" value={service?.nom ?? "—"} />
              <Row label="Catégorie" value={categorie?.nom ?? "—"} />
              <Row label="Sexe" value={agent.sexe === "M" ? "Masculin" : "Féminin"} />
              <Row label="Date de naissance" value={`${formatDate(agent.date_naissance)} (${ageFromDate(agent.date_naissance)} ans)`} />
              <Row label="Recrutement" value={`${formatDate(agent.date_recrutement)} (${ancienneteAnnees(agent.date_recrutement)} ans)`} />
              <Row label="Prise de fonction" value={formatDate(agent.date_prise_fonction)} />
              <Row label="Lieu d'affectation" value={agent.lieu_affectation ?? "—"} />
              <Row label="E-mail" value={agent.email ?? "—"} />
              <Row label="Téléphone" value={agent.telephone ?? "—"} />
              <Row label="Situation administrative" value={agent.situation_administrative ?? "—"} />
            </dl>

            {!agent.actif && (
              <div className="mt-4 w-full rounded-lg bg-danger-soft p-3 text-left text-xs text-danger">
                Sorti le {formatDate(agent.date_sortie)} — {agent.motif_sortie ?? "motif non précisé"}
              </div>
            )}

            {canManage && agent.actif && (
              <details className="mt-4 w-full text-left">
                <summary className="cursor-pointer text-xs font-medium text-danger flex items-center gap-1">
                  <LogOutIcon className="h-3.5 w-3.5" /> Enregistrer un départ
                </summary>
                <div className="mt-2">
                  <DepartForm agentId={agent.id} typesMouvement={typesMouvementRes.data ?? []} />
                </div>
              </details>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody>
            <AgentTabs
              tabs={[
                {
                  key: "carriere",
                  label: "Carrière",
                  content: (
                    <div className="space-y-4">
                      {canManage && <HistoriqueForm agentId={agent.id} />}
                      <Timeline
                        items={[
                          {
                            date: agent.date_recrutement,
                            title: "Recrutement",
                            detail: [grade?.nom, service?.nom].filter(Boolean).join(" · "),
                          },
                          ...carriereItems,
                        ].sort((a, b) => (a.date < b.date ? 1 : -1))}
                      />
                    </div>
                  ),
                },
                {
                  key: "absences",
                  label: "Absences",
                  content: (
                    <SimpleTable
                      empty="Aucune absence enregistrée."
                      head={["Type", "Période", "Jours", "Statut"]}
                      rows={(absencesRes.data ?? []).map((a) => [
                        a.types_absence?.nom ?? "—",
                        `${formatDate(a.date_debut)} → ${formatDate(a.date_fin)}`,
                        formatNumber(a.nb_jours, 1),
                        <Badge key="s" tone={a.statut === "validee" ? "success" : a.statut === "refusee" ? "danger" : "warning"}>
                          {a.statut}
                        </Badge>,
                      ])}
                    />
                  ),
                },
                {
                  key: "formations",
                  label: "Formations",
                  content: (
                    <SimpleTable
                      empty="Aucune formation suivie."
                      head={["Formation", "Période", "Statut", "Résultat"]}
                      rows={(formationsRes.data ?? []).map((f) => [
                        f.formations?.titre ?? "—",
                        `${formatDate(f.formations?.date_debut)} → ${formatDate(f.formations?.date_fin)}`,
                        f.statut,
                        f.resultat ?? "—",
                      ])}
                    />
                  ),
                },
                {
                  key: "competences",
                  label: "Compétences",
                  content: (
                    <SimpleTable
                      empty="Aucune compétence enregistrée."
                      head={["Compétence", "Catégorie", "Niveau"]}
                      rows={(competencesRes.data ?? []).map((c) => [
                        c.competences?.nom ?? "—",
                        c.competences?.categorie ?? "—",
                        "●".repeat(c.niveau) + "○".repeat(5 - c.niveau),
                      ])}
                    />
                  ),
                },
                {
                  key: "performance",
                  label: "Performance",
                  content: (
                    <SimpleTable
                      empty="Aucune évaluation enregistrée."
                      head={["Campagne", "Date", "Note", "Taux d'atteinte"]}
                      rows={(evaluationsRes.data ?? []).map((e) => [
                        e.campagnes_evaluation?.nom ?? "—",
                        formatDate(e.date_evaluation),
                        e.note_globale != null ? formatNumber(e.note_globale, 1) : "—",
                        e.taux_atteinte != null ? `${formatNumber(e.taux_atteinte, 1)} %` : "—",
                      ])}
                    />
                  ),
                },
                {
                  key: "historique",
                  label: "Historique",
                  content: (
                    <SimpleTable
                      empty="Aucune modification enregistrée."
                      head={["Date", "Champ", "Évolution", "Motif"]}
                      rows={(historiqueRes.data ?? []).map((h) => [
                        formatDate(h.date_effet),
                        h.champ,
                        `${h.ancienne_valeur ?? "—"} → ${h.nouvelle_valeur ?? "—"}`,
                        h.motif ?? "—",
                      ])}
                    />
                  ),
                },
                ...(canSeeRemuneration
                  ? [
                      {
                        key: "remuneration",
                        label: "Rémunération",
                        content: (
                          <SimpleTable
                            empty="Aucune donnée de rémunération."
                            head={["Période", "Salaire de base", "Primes", "Indemnités", "Total"]}
                            rows={(remunerationsRes.data ?? []).map((r) => [
                              formatDate(r.periode),
                              formatCurrency(r.salaire_base),
                              formatCurrency(r.primes),
                              formatCurrency(r.indemnites),
                              formatCurrency(r.total),
                            ])}
                          />
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border py-1.5 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Timeline({ items }: { items: { date: string; title: string; detail: string }[] }) {
  if (items.length === 0) return <p className="text-sm text-muted">Aucun évènement enregistré.</p>;
  return (
    <ol className="space-y-4 border-l border-border pl-4">
      {items.map((item, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
          <div className="text-xs text-muted">{formatDate(item.date)}</div>
          <div className="text-sm font-medium capitalize text-foreground">{item.title}</div>
          <div className="text-xs text-muted">{item.detail}</div>
        </li>
      ))}
    </ol>
  );
}

function SimpleTable({
  head,
  rows,
  empty,
}: {
  head: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-medium uppercase tracking-wide text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-border px-2 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="px-2 py-6 text-center text-muted">
                {empty}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
