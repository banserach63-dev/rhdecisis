import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ReferentielManager, type ReferentielRow } from "@/components/referentiels/referentiel-manager";

export default async function RegionsPage() {
  const profile = await requireRole("admin", "drh");
  const supabase = await createClient();
  const { data } = await supabase.from("regions").select("*").order("nom");

  return (
    <div>
      <PageHeader title="Régions" description="Référentiel des régions administratives." />
      <ReferentielManager
        table="regions"
        path="/regions"
        title="Région"
        canWrite={["admin", "drh"].includes(profile.role)}
        fields={[
          { name: "code", label: "Code", type: "text", required: true },
          { name: "nom", label: "Nom", type: "text", required: true },
        ]}
        columns={[
          { key: "code", label: "Code" },
          { key: "nom", label: "Nom" },
        ]}
        rows={(data as unknown as ReferentielRow[]) ?? []}
      />
    </div>
  );
}
