import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ReferentielManager, type ReferentielRow } from "@/components/referentiels/referentiel-manager";

export default async function NaturesStructurePage() {
  const profile = await requireRole("admin", "drh");
  const supabase = await createClient();
  const { data } = await supabase.from("natures_structure").select("*").order("nom");

  return (
    <div>
      <PageHeader
        title="Nature de structure"
        description="Référentiel de typage des directions (ex. Direction centrale, Direction régionale, Service déconcentré)."
      />
      <ReferentielManager
        table="natures_structure"
        path="/natures-structure"
        title="Nature de structure"
        canWrite={["admin", "drh"].includes(profile.role)}
        fields={[
          { name: "code", label: "Code", type: "text", required: true },
          { name: "nom", label: "Nom", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
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
