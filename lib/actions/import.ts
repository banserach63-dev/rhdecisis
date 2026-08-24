"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export interface ImportRowResult {
  line: number;
  matricule?: string;
  error: string;
}

export interface ImportSummary {
  jobId: string;
  total: number;
  succes: number;
  erreurs: ImportRowResult[];
}

const REQUIRED_COLUMNS = ["matricule", "nom", "prenom", "sexe", "date_naissance", "date_recrutement"];

export async function importAgentsRows(
  fileName: string,
  format: "csv" | "xlsx",
  rows: Record<string, string>[]
): Promise<ImportSummary | { error: string }> {
  const profile = await requireRole("admin", "drh");
  const supabase = await createClient();

  const { data: job, error: jobError } = await supabase
    .from("import_jobs")
    .insert({ nom_fichier: fileName, type_import: "agents", format, statut: "en_cours", nb_lignes: rows.length, importe_par: profile.id })
    .select("id")
    .single();

  if (jobError || !job) return { error: jobError?.message ?? "Impossible de créer le job d'import." };

  const [directions, services, grades, categories, statuts] = await Promise.all([
    supabase.from("directions").select("id, code"),
    supabase.from("services").select("id, code"),
    supabase.from("grades").select("id, code"),
    supabase.from("categories").select("id, code"),
    supabase.from("statuts").select("id, code"),
  ]);

  const mapByCode = (rows: { id: string; code: string }[] | null) =>
    new Map((rows ?? []).map((r) => [r.code.toUpperCase(), r.id]));

  const dirMap = mapByCode(directions.data);
  const svcMap = mapByCode(services.data);
  const gradeMap = mapByCode(grades.data);
  const catMap = mapByCode(categories.data);
  const statutMap = mapByCode(statuts.data);

  const erreurs: ImportRowResult[] = [];
  let succes = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const line = i + 2; // header is line 1
    const missing = REQUIRED_COLUMNS.filter((c) => !row[c]?.trim());
    if (missing.length > 0) {
      erreurs.push({ line, matricule: row.matricule, error: `Colonnes manquantes : ${missing.join(", ")}` });
      continue;
    }
    if (!["M", "F"].includes(row.sexe.toUpperCase())) {
      erreurs.push({ line, matricule: row.matricule, error: "Sexe invalide (attendu M ou F)." });
      continue;
    }

    const payload = {
      matricule: row.matricule.trim(),
      nom: row.nom.trim(),
      prenom: row.prenom.trim(),
      sexe: row.sexe.toUpperCase(),
      date_naissance: row.date_naissance,
      date_recrutement: row.date_recrutement,
      date_prise_fonction: row.date_prise_fonction || null,
      direction_id: row.direction_code ? dirMap.get(row.direction_code.toUpperCase()) ?? null : null,
      service_id: row.service_code ? svcMap.get(row.service_code.toUpperCase()) ?? null : null,
      grade_id: row.grade_code ? gradeMap.get(row.grade_code.toUpperCase()) ?? null : null,
      categorie_id: row.categorie_code ? catMap.get(row.categorie_code.toUpperCase()) ?? null : null,
      statut_id: row.statut_code ? statutMap.get(row.statut_code.toUpperCase()) ?? null : null,
      email: row.email || null,
      telephone: row.telephone || null,
      lieu_affectation: row.lieu_affectation || null,
    };

    const { error } = await supabase.from("agents").upsert(payload, { onConflict: "matricule" });
    if (error) {
      erreurs.push({ line, matricule: row.matricule, error: error.message });
    } else {
      succes++;
    }
  }

  const statut = erreurs.length === 0 ? "termine" : succes === 0 ? "erreur" : "partiel";
  await supabase
    .from("import_jobs")
    .update({ statut, nb_succes: succes, nb_erreurs: erreurs.length, erreurs, completed_at: new Date().toISOString() })
    .eq("id", job.id);

  revalidatePath("/import");
  revalidatePath("/agents");

  return { jobId: job.id, total: rows.length, succes, erreurs };
}
