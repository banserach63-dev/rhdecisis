"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function runQualityScan() {
  const profile = await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();

  const { data: agents } = await supabase
    .from("agents")
    .select("id, matricule, nom, prenom, date_naissance, date_recrutement, date_prise_fonction, date_sortie, actif, service_id, grade_id, statut_id, email, telephone, lieu_affectation, updated_at");

  const list = agents ?? [];
  const total = list.length || 1;
  const anomalies: {
    type_anomalie: string;
    gravite: string;
    table_concernee: string;
    record_id: string | null;
    agent_id: string | null;
    description: string;
  }[] = [];

  // 1. Doublons (nom + prénom + date de naissance identiques)
  const seen = new Map<string, string[]>();
  list.forEach((a) => {
    const key = `${a.nom.trim().toLowerCase()}|${a.prenom.trim().toLowerCase()}|${a.date_naissance}`;
    seen.set(key, [...(seen.get(key) ?? []), a.id]);
  });
  let doublons = 0;
  seen.forEach((ids) => {
    if (ids.length > 1) {
      doublons += ids.length;
      ids.forEach((id) =>
        anomalies.push({
          type_anomalie: "doublon",
          gravite: "haute",
          table_concernee: "agents",
          record_id: id,
          agent_id: id,
          description: "Doublon potentiel détecté (nom, prénom et date de naissance identiques).",
        })
      );
    }
  });

  // 2. Champs obligatoires non renseignés
  let champsManquants = 0;
  list.forEach((a) => {
    const manquants: string[] = [];
    if (!a.email) manquants.push("e-mail");
    if (!a.telephone) manquants.push("téléphone");
    if (!a.lieu_affectation) manquants.push("lieu d'affectation");
    if (!a.statut_id) manquants.push("statut");
    if (manquants.length > 0) {
      champsManquants++;
      anomalies.push({
        type_anomalie: "champ_obligatoire_manquant",
        gravite: "moyenne",
        table_concernee: "agents",
        record_id: a.id,
        agent_id: a.id,
        description: `Champs manquants : ${manquants.join(", ")}.`,
      });
    }
  });

  // 3. Dates incohérentes
  let datesIncoherentes = 0;
  list.forEach((a) => {
    const problemes: string[] = [];
    if (a.date_prise_fonction && a.date_prise_fonction < a.date_recrutement) problemes.push("prise de fonction antérieure au recrutement");
    if (a.date_sortie && a.date_sortie < a.date_recrutement) problemes.push("date de sortie antérieure au recrutement");
    const age = new Date().getFullYear() - new Date(a.date_naissance).getFullYear();
    if (age < 18 || age > 70) problemes.push("âge incohérent");
    if (problemes.length > 0) {
      datesIncoherentes++;
      anomalies.push({
        type_anomalie: "date_incoherente",
        gravite: "haute",
        table_concernee: "agents",
        record_id: a.id,
        agent_id: a.id,
        description: problemes.join(", "),
      });
    }
  });

  // 4. Agents sans service / sans grade
  let sansService = 0;
  let sansGrade = 0;
  list
    .filter((a) => a.actif)
    .forEach((a) => {
      if (!a.service_id) {
        sansService++;
        anomalies.push({
          type_anomalie: "agent_sans_service",
          gravite: "moyenne",
          table_concernee: "agents",
          record_id: a.id,
          agent_id: a.id,
          description: "Agent actif sans service affecté.",
        });
      }
      if (!a.grade_id) {
        sansGrade++;
        anomalies.push({
          type_anomalie: "agent_sans_grade",
          gravite: "moyenne",
          table_concernee: "agents",
          record_id: a.id,
          agent_id: a.id,
          description: "Agent actif sans grade renseigné.",
        });
      }
    });

  // 5. Matricules invalides (format attendu : lettres suivies de chiffres, longueur >= 4)
  let matriculesInvalides = 0;
  list.forEach((a) => {
    if (!/^[A-Za-z]{2,}\d{3,}$/.test(a.matricule)) {
      matriculesInvalides++;
      anomalies.push({
        type_anomalie: "matricule_invalide",
        gravite: "basse",
        table_concernee: "agents",
        record_id: a.id,
        agent_id: a.id,
        description: `Format de matricule inhabituel : ${a.matricule}.`,
      });
    }
  });

  // 6. Données obsolètes (non mises à jour depuis plus de 2 ans)
  const seuilObsolete = Date.now() - 730 * 24 * 60 * 60 * 1000;
  let obsoletes = 0;
  list.forEach((a) => {
    if (new Date(a.updated_at).getTime() < seuilObsolete) {
      obsoletes++;
      anomalies.push({
        type_anomalie: "donnee_obsolete",
        gravite: "basse",
        table_concernee: "agents",
        record_id: a.id,
        agent_id: a.id,
        description: "Fiche agent non actualisée depuis plus de 2 ans.",
      });
    }
  });

  const completude = Math.max(0, 100 - (champsManquants / total) * 100);
  const coherence = Math.max(0, 100 - ((datesIncoherentes + sansService + sansGrade) / total) * 100);
  const unicite = Math.max(0, 100 - (doublons / total) * 100);
  const actualisation = Math.max(0, 100 - (obsoletes / total) * 100);
  const scoreGlobal = (completude + coherence + unicite + actualisation) / 4;

  const { data: scan, error } = await supabase
    .from("quality_scans")
    .insert({
      lance_par: profile.id,
      score_global: Math.round(scoreGlobal * 10) / 10,
      completude: Math.round(completude * 10) / 10,
      coherence: Math.round(coherence * 10) / 10,
      unicite: Math.round(unicite * 10) / 10,
      actualisation: Math.round(actualisation * 10) / 10,
      nb_anomalies: anomalies.length,
    })
    .select("id")
    .single();

  if (error || !scan) return { error: error?.message ?? "Erreur lors de la création du scan." };

  if (anomalies.length > 0) {
    await supabase.from("quality_anomalies").insert(anomalies.map((a) => ({ ...a, scan_id: scan.id })));
  }

  // Générer des alertes qualité pour les anomalies de gravité haute
  const critiques = anomalies.filter((a) => a.gravite === "haute");
  if (critiques.length > 0) {
    await supabase.from("alertes").insert({
      rule_code: "DOSSIER_INCOMPLET",
      niveau: "qualite",
      titre: `${critiques.length} anomalie(s) critique(s) détectée(s) lors du contrôle qualité`,
      description: "Consultez la page Qualité des données pour le détail.",
      donnees: { scan_id: scan.id, matricules_invalides: matriculesInvalides },
    });
  }

  revalidatePath("/qualite");
  revalidatePath("/alertes");
  return { success: true };
}

export async function resolveAnomaly(id: string) {
  await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();
  await supabase.from("quality_anomalies").update({ statut: "corrigee", resolved_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/qualite");
}
