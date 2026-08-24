import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParticipantRow } from "@/components/formations/participant-row";
import { AddParticipantForm } from "@/components/formations/add-participant-form";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function FormationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service", "direction_generale");
  const supabase = await createClient();

  const { data: formation } = await supabase
    .from("formations")
    .select("*, organismes_formation(nom), competences(nom)")
    .eq("id", id)
    .maybeSingle();
  if (!formation) notFound();

  const [participantsRes, agentsRes] = await Promise.all([
    supabase.from("formation_participants").select("*, agents(nom, prenom)").eq("formation_id", id),
    supabase.from("agents").select("id, nom, prenom, matricule").eq("actif", true).order("nom"),
  ]);

  const inscrits = new Set((participantsRes.data ?? []).map((p) => p.agent_id));
  const canWrite = ["admin", "drh", "responsable_rh"].includes(profile.role);

  return (
    <div>
      <PageHeader
        title={formation.titre}
        description={`${formation.organismes_formation?.nom ?? "Organisme non précisé"} · ${formation.competences?.nom ?? "Compétence non précisée"}`}
        action={<Badge tone="info">{formation.statut.replace("_", " ")}</Badge>}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader title="Informations" />
          <CardBody className="space-y-2 text-sm">
            <p>
              <span className="text-muted">Période : </span>
              {formatDate(formation.date_debut)} → {formatDate(formation.date_fin)}
            </p>
            <p>
              <span className="text-muted">Lieu : </span>
              {formation.lieu ?? "—"}
            </p>
            <p>
              <span className="text-muted">Durée : </span>
              {formation.duree_heures ?? "—"} h
            </p>
            <p>
              <span className="text-muted">Coût : </span>
              {formatCurrency(formation.cout)}
            </p>
            <p>
              <span className="text-muted">Capacité : </span>
              {formation.capacite ?? "Non limitée"}
            </p>
            {formation.description && <p className="text-muted">{formation.description}</p>}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Participants" description={`${participantsRes.data?.length ?? 0} inscrit(s)`} />
          <CardBody>
            {canWrite && (
              <div className="mb-4">
                <AddParticipantForm
                  formationId={id}
                  agents={
                    agentsRes.data
                      ?.filter((a) => !inscrits.has(a.id))
                      .map((a) => ({ id: a.id, label: `${a.matricule} — ${a.prenom} ${a.nom}` })) ?? []
                  }
                />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <tr>
                    <th className="border-b border-border px-2 py-2">Agent</th>
                    <th className="border-b border-border px-2 py-2">Statut / Résultat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(participantsRes.data ?? []).length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-2 py-6 text-center text-muted">
                        Aucun participant inscrit.
                      </td>
                    </tr>
                  )}
                  {(participantsRes.data ?? []).map((p) => (
                    <ParticipantRow key={p.id} formationId={id} participant={p} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
