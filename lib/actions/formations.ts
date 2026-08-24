"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export type FormationActionState = { error?: string } | undefined;

export async function createFormation(_prev: FormationActionState, formData: FormData): Promise<FormationActionState> {
  await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();

  const titre = String(formData.get("titre") || "");
  if (!titre) return { error: "Le titre est obligatoire." };

  const payload = {
    titre,
    description: String(formData.get("description") || "") || null,
    organisme_id: String(formData.get("organisme_id") || "") || null,
    competence_id: String(formData.get("competence_id") || "") || null,
    cout: Number(formData.get("cout") || 0),
    duree_heures: formData.get("duree_heures") ? Number(formData.get("duree_heures")) : null,
    date_debut: String(formData.get("date_debut") || "") || null,
    date_fin: String(formData.get("date_fin") || "") || null,
    lieu: String(formData.get("lieu") || "") || null,
    capacite: formData.get("capacite") ? Number(formData.get("capacite")) : null,
    statut: String(formData.get("statut") || "planifiee"),
  };

  const { data, error } = await supabase.from("formations").insert(payload).select("id").single();
  if (error) return { error: error.message };

  revalidatePath("/formations");
  redirect(`/formations/${data.id}`);
}

export async function addParticipant(formationId: string, formData: FormData) {
  await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();
  const agentId = String(formData.get("agent_id") || "");
  if (!agentId) return;

  await supabase.from("formation_participants").insert({ formation_id: formationId, agent_id: agentId, statut: "inscrit" });
  revalidatePath(`/formations/${formationId}`);
}

export async function updateParticipant(formationId: string, participantId: string, formData: FormData) {
  await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();
  const statut = String(formData.get("statut") || "inscrit");
  const resultat = String(formData.get("resultat") || "") || null;
  const note = formData.get("note") ? Number(formData.get("note")) : null;

  await supabase.from("formation_participants").update({ statut, resultat, note }).eq("id", participantId);

  if (statut === "complete") {
    const { data: participant } = await supabase
      .from("formation_participants")
      .select("agent_id, formations(competence_id)")
      .eq("id", participantId)
      .single();
    const competenceId = (participant?.formations as unknown as { competence_id: string | null } | null)?.competence_id;
    if (participant && competenceId) {
      await supabase
        .from("agent_competences")
        .upsert(
          { agent_id: participant.agent_id, competence_id: competenceId, niveau: 3, source: "formation", formation_id: formationId },
          { onConflict: "agent_id,competence_id" }
        );
    }
  }

  revalidatePath(`/formations/${formationId}`);
}
