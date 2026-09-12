import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ReferentielManager, type ReferentielRow } from "@/components/referentiels/referentiel-manager";

export default async function ProvincesPage() {
  const profile = await requireRole("admin", "drh");
  const supabase = await createClient();

  const [{ data: provinces }, { data: regions }] = await Promise.all([
    supabase.from("provinces").select("*, regions(nom)").order("nom"),
    supabase.from("regions").select("id, nom").eq("actif", true).order("nom"),
  ]);

  const rows = (provinces ?? []).map((p) => ({
    ...p,
    region_nom: (p as unknown as { regions?: { nom: string } | null }).regions?.nom ?? "—",
  }));

  return (
    <div>
      <PageHeader title="Provinces" description="Référentiel des provinces, rattachées à une région." />
      <ReferentielManager
        table="provinces"
        path="/provinces"
        title="Province"
        canWrite={["admin", "drh"].includes(profile.role)}
        fields={[
          { name: "code", label: "Code", type: "text", required: true },
          { name: "nom", label: "Nom", type: "text", required: true },
          {
            name: "region_id",
            label: "Région",
            type: "select",
            options: regions?.map((r) => ({ value: r.id, label: r.nom })) ?? [],
          },
        ]}
        columns={[
          { key: "code", label: "Code" },
          { key: "nom", label: "Nom" },
          { key: "region_nom", label: "Région" },
        ]}
        rows={(rows as unknown as ReferentielRow[]) ?? []}
      />
    </div>
  );
}
