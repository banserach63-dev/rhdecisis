import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate, ageFromDate } from "@/lib/format";

const AGE_RETRAITE = 62;

function currentTimestamp() {
  return Date.now();
}

export default async function CarrieresPage() {
  await requireRole("admin", "drh", "responsable_rh", "chef_service", "direction_generale");
  const supabase = await createClient();
  const now = currentTimestamp();

  const [evenementsRes, agentsRes] = await Promise.all([
    supabase
      .from("carriere_evenements")
      .select("*, agents(id, nom, prenom, matricule), grades(nom), services(nom)")
      .order("date_evenement", { ascending: false })
      .limit(150),
    supabase.from("agents").select("id, nom, prenom, matricule, date_naissance, services(nom)").eq("actif", true),
  ]);

  const evenements = evenementsRes.data ?? [];

  type AgentEcheance = { id: string; nom: string; prenom: string; matricule: string; date_naissance: string; services: { nom: string } | null };
  const echeancesRetraite = ((agentsRes.data ?? []) as unknown as AgentEcheance[])
    .map((a) => {
      const birth = new Date(a.date_naissance);
      const dateRetraite = new Date(birth.getFullYear() + AGE_RETRAITE, birth.getMonth(), birth.getDate());
      return { agent: a, dateRetraite };
    })
    .filter((x) => {
      const monthsAway = (x.dateRetraite.getTime() - now) / (1000 * 60 * 60 * 24 * 30);
      return monthsAway >= -6 && monthsAway <= 18;
    })
    .sort((a, b) => a.dateRetraite.getTime() - b.dateRetraite.getTime());

  const TYPE_LABELS: Record<string, string> = {
    recrutement: "Recrutement",
    affectation: "Affectation",
    avancement: "Avancement",
    promotion: "Promotion",
    mutation: "Mutation",
    nouvelle_responsabilite: "Nouvelle responsabilité",
    retraite: "Retraite",
    depart: "Départ",
  };

  return (
    <div>
      <PageHeader
        title="Carrières"
        description="Parcours professionnel des agents : recrutement, affectation, avancement, promotion, mutation, retraite."
      />

      <Card className="mb-6">
        <CardHeader
          title="Échéances de carrière à venir"
          description={`Agents approchant l'âge de départ à la retraite (${AGE_RETRAITE} ans)`}
        />
        <CardBody>
          {echeancesRetraite.length === 0 ? (
            <p className="text-sm text-muted">Aucune échéance de retraite dans les 18 prochains mois.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <tr>
                    <th className="border-b border-border px-2 py-2">Agent</th>
                    <th className="border-b border-border px-2 py-2">Service</th>
                    <th className="border-b border-border px-2 py-2">Âge actuel</th>
                    <th className="border-b border-border px-2 py-2">Date de retraite estimée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {echeancesRetraite.map(({ agent, dateRetraite }) => (
                    <tr key={agent.id}>
                      <td className="px-2 py-2">
                        <Link href={`/agents/${agent.id}`} className="font-medium text-primary hover:underline">
                          {agent.prenom} {agent.nom}
                        </Link>
                      </td>
                      <td className="px-2 py-2 text-muted">{agent.services?.nom ?? "—"}</td>
                      <td className="px-2 py-2">{ageFromDate(agent.date_naissance)} ans</td>
                      <td className="px-2 py-2">
                        <Badge tone={dateRetraite.getTime() < now + 1000 * 60 * 60 * 24 * 180 ? "danger" : "warning"}>
                          {dateRetraite.toLocaleDateString("fr-FR")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Historique des évènements de carrière" description="Tous agents confondus (périmètre autorisé)" />
        <CardBody>
          {evenements.length === 0 ? (
            <p className="text-sm text-muted">Aucun évènement enregistré.</p>
          ) : (
            <ol className="space-y-4 border-l border-border pl-4">
              {evenements.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="text-xs text-muted">{formatDate(e.date_evenement)}</div>
                  <div className="text-sm">
                    <Link href={`/agents/${e.agents?.id}`} className="font-medium text-foreground hover:text-primary">
                      {e.agents ? `${e.agents.prenom} ${e.agents.nom}` : "Agent"}
                    </Link>{" "}
                    — <span className="font-medium">{TYPE_LABELS[e.type_evenement] ?? e.type_evenement}</span>
                  </div>
                  <div className="text-xs text-muted">
                    {[e.description, e.grades?.nom, e.services?.nom].filter(Boolean).join(" · ")}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
