import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ReferentielManager, type ReferentielRow } from "@/components/referentiels/referentiel-manager";

export default async function CategoriesPage() {
  const profile = await requireRole("admin", "drh");
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("ordre");

  return (
    <div>
      <PageHeader title="Catégories" description="Référentiel des catégories professionnelles utilisées par l'organisation." />
      <ReferentielManager
        table="categories"
        path="/categories"
        title="Catégorie"
        canWrite={["admin", "drh"].includes(profile.role)}
        fields={[
          { name: "code", label: "Code", type: "text", required: true },
          { name: "nom", label: "Nom", type: "text", required: true },
          { name: "ordre", label: "Ordre d'affichage", type: "number" },
          { name: "description", label: "Description", type: "textarea" },
        ]}
        columns={[
          { key: "code", label: "Code" },
          { key: "nom", label: "Nom" },
          { key: "ordre", label: "Ordre" },
        ]}
        rows={(data as unknown as ReferentielRow[]) ?? []}
      />
    </div>
  );
}
