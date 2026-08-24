"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, requireRole } from "@/lib/auth";

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function generateAlertes() {
  await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();

  const [{ data: rules }, { data: agents }, { data: services }] = await Promise.all([
    supabase.from("alert_rules").select("*").eq("actif", true),
    supabase.from("agents").select("id, nom, prenom, date_naissance, direction_id, service_id").eq("actif", true),
    supabase.from("services").select("id, nom, direction_id").eq("actif", true),
  ]);

  const ruleMap = new Map((rules ?? []).map((r) => [r.code, r]));
  let created = 0;

  // Retraite imminente
  const retraiteRule = ruleMap.get("RETRAITE_PROCHE");
  if (retraiteRule) {
    const ageRetraite = retraiteRule.seuil ?? 62;
    for (const a of agents ?? []) {
      const birth = new Date(a.date_naissance);
      const dateRetraite = new Date(birth.getFullYear() + ageRetraite, birth.getMonth(), birth.getDate());
      const monthsAway = (dateRetraite.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAway >= 0 && monthsAway <= 12) {
        const { data: existing } = await supabase
          .from("alertes")
          .select("id")
          .eq("rule_code", "RETRAITE_PROCHE")
          .eq("agent_id", a.id)
          .neq("statut", "traitee")
          .maybeSingle();
        if (!existing) {
          await supabase.from("alertes").insert({
            rule_code: "RETRAITE_PROCHE",
            niveau: "critique",
            titre: `Départ à la retraite prévu pour ${a.prenom} ${a.nom}`,
            description: `Date de retraite estimée : ${dateRetraite.toLocaleDateString("fr-FR")}.`,
            agent_id: a.id,
            direction_id: a.direction_id,
            service_id: a.service_id,
            donnees: { date_retraite: fmt(dateRetraite) },
          });
          created++;
        }
      }
    }
  }

  // Absentéisme par service
  const absRule = ruleMap.get("ABSENTEISME_SERVICE");
  if (absRule) {
    const seuil = absRule.seuil ?? 8;
    const dateFin = fmt(new Date());
    const dateDebut = fmt(new Date(Date.now() - 90 * 86400000));
    for (const s of services ?? []) {
      const { data: taux } = await supabase.rpc("kpi_absenteisme", {
        p_date_debut: dateDebut,
        p_date_fin: dateFin,
        p_service_id: s.id,
      });
      if ((taux as number) > seuil) {
        const { data: existing } = await supabase
          .from("alertes")
          .select("id")
          .eq("rule_code", "ABSENTEISME_SERVICE")
          .eq("service_id", s.id)
          .neq("statut", "traitee")
          .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
          .maybeSingle();
        if (!existing) {
          await supabase.from("alertes").insert({
            rule_code: "ABSENTEISME_SERVICE",
            niveau: "importante",
            titre: `Absentéisme élevé — ${s.nom}`,
            description: `Taux d'absentéisme de ${(taux as number).toFixed(1)} % sur les 90 derniers jours (seuil : ${seuil} %).`,
            direction_id: s.direction_id,
            service_id: s.id,
            donnees: { taux },
          });
          created++;
        }
      }
    }
  }

  revalidatePath("/alertes");
  return { created };
}

export async function markAlerteStatut(id: string, statut: "vue" | "traitee" | "ignoree") {
  const profile = await requireProfile();
  const supabase = await createClient();
  const patch: Record<string, unknown> = { statut };
  if (statut === "vue") {
    patch.vue_par = profile.id;
    patch.vue_at = new Date().toISOString();
  }
  if (statut === "traitee") {
    patch.traitee_par = profile.id;
    patch.traitee_at = new Date().toISOString();
  }
  await supabase.from("alertes").update(patch).eq("id", id);
  revalidatePath("/alertes");
}
