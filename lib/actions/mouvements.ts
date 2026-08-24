"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export type MouvementActionState = { error?: string; success?: boolean } | undefined;

const EVENEMENT_PAR_TYPE: Record<string, string> = {
  MUTATION: "mutation",
  AFFECTATION: "affectation",
  DETACHEMENT: "affectation",
  DISPONIBILITE: "affectation",
  PROMOTION: "promotion",
  CHANGT_GRADE: "avancement",
  DEPART_DEM: "depart",
  DEPART_RET: "retraite",
  DEPART_FIN: "depart",
};

export async function createMouvement(_prev: MouvementActionState, formData: FormData): Promise<MouvementActionState> {
  await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();

  const agentId = String(formData.get("agent_id") || "");
  const typeMouvementId = String(formData.get("type_mouvement_id") || "");
  const dateEffet = String(formData.get("date_effet") || "");
  const directionDestinationId = String(formData.get("direction_destination_id") || "") || null;
  const serviceDestinationId = String(formData.get("service_destination_id") || "") || null;
  const gradeDestinationId = String(formData.get("grade_destination_id") || "") || null;
  const motif = String(formData.get("motif") || "") || null;
  const referenceDecision = String(formData.get("reference_decision") || "") || null;

  if (!agentId || !typeMouvementId || !dateEffet) {
    return { error: "Agent, type de mouvement et date d'effet sont obligatoires." };
  }

  const { data: type } = await supabase.from("types_mouvement").select("code, sens").eq("id", typeMouvementId).single();
  const { data: agent } = await supabase
    .from("agents")
    .select("direction_id, service_id, grade_id")
    .eq("id", agentId)
    .single();

  const { error } = await supabase.from("mouvements").insert({
    agent_id: agentId,
    type_mouvement_id: typeMouvementId,
    date_effet: dateEffet,
    direction_origine_id: agent?.direction_id ?? null,
    service_origine_id: agent?.service_id ?? null,
    grade_origine_id: agent?.grade_id ?? null,
    direction_destination_id: directionDestinationId,
    service_destination_id: serviceDestinationId,
    grade_destination_id: gradeDestinationId,
    motif,
    reference_decision: referenceDecision,
  });

  if (error) return { error: error.message };

  if (type?.sens === "sortie") {
    await supabase.from("agents").update({ actif: false, date_sortie: dateEffet, motif_sortie: motif }).eq("id", agentId);
  } else if (type?.sens === "interne") {
    const updates: Record<string, string> = {};
    if (directionDestinationId) updates.direction_id = directionDestinationId;
    if (serviceDestinationId) updates.service_id = serviceDestinationId;
    if (gradeDestinationId) updates.grade_id = gradeDestinationId;
    if (Object.keys(updates).length > 0) {
      await supabase.from("agents").update(updates).eq("id", agentId);
    }
  }

  const evenement = (type?.code && EVENEMENT_PAR_TYPE[type.code]) || "affectation";
  await supabase.from("carriere_evenements").insert({
    agent_id: agentId,
    type_evenement: evenement,
    date_evenement: dateEffet,
    description: motif,
    grade_id: gradeDestinationId,
    service_id: serviceDestinationId,
    direction_id: directionDestinationId,
  });

  revalidatePath("/mouvements");
  revalidatePath(`/agents/${agentId}`);
  revalidatePath("/carrieres");
  return { success: true };
}
