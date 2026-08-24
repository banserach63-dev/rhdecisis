import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ReferentielManager } from "@/components/referentiels/referentiel-manager";

export default async function GradesPage() {
  const profile = await requireRole("admin", "drh");
  const supabase = await createClient();

  const { data: grades } = await supabase.from("grades").select("*, categories(nom)").order("nom");
  const { data: categories } = await supabase.from("categories").select("id, nom").order("ordre");

  const rows = (grades ?? []).map((g) => ({
    ...g,
    categorie_nom: (g as { categories?: { nom: string } | null }).categories?.nom ?? "—",
  }));

  return (
    <div>
      <PageHeader title="Grades" description="Référentiel des grades, rattachés à une catégorie professionnelle." />
      <ReferentielManager
        table="grades"
        path="/grades"
        title="Grade"
        canWrite={["admin", "drh"].includes(profile.role)}
        fields={[
          { name: "code", label: "Code", type: "text", required: true },
          { name: "nom", label: "Nom", type: "text", required: true },
          {
            name: "categorie_id",
            label: "Catégorie",
            type: "select",
            options: categories?.map((c) => ({ value: c.id, label: c.nom })) ?? [],
          },
          { name: "echelon", label: "Échelon", type: "text" },
        ]}
        columns={[
          { key: "code", label: "Code" },
          { key: "nom", label: "Nom" },
          { key: "categorie_nom", label: "Catégorie" },
          { key: "echelon", label: "Échelon" },
        ]}
        rows={rows}
      />
    </div>
  );
}
