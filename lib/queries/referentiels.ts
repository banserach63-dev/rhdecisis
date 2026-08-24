import { createClient } from "@/lib/supabase/server";

export async function loadAgentFormReferentiels() {
  const supabase = await createClient();
  const [directions, services, grades, categories, statuts, fonctions] = await Promise.all([
    supabase.from("directions").select("id, nom").eq("actif", true).order("nom"),
    supabase.from("services").select("id, nom, direction_id").eq("actif", true).order("nom"),
    supabase.from("grades").select("id, nom").eq("actif", true).order("nom"),
    supabase.from("categories").select("id, nom").eq("actif", true).order("ordre"),
    supabase.from("statuts").select("id, nom").eq("actif", true).order("nom"),
    supabase.from("fonctions").select("id, nom").eq("actif", true).order("nom"),
  ]);

  return {
    directions: directions.data ?? [],
    services: services.data ?? [],
    grades: grades.data ?? [],
    categories: categories.data ?? [],
    statuts: statuts.data ?? [],
    fonctions: fonctions.data ?? [],
  };
}
