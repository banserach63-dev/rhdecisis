import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ReferentielManager, type ReferentielRow } from "@/components/referentiels/referentiel-manager";

export default async function DirectionsPage() {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service", "direction_generale");
  const supabase = await createClient();

  const { data: directions } = await supabase
    .from("directions")
    .select("*, agents:responsable_agent_id(nom, prenom)")
    .order("nom");

  const { data: services } = await supabase.from("services").select("direction_id");
  const { data: agents } = await supabase.from("agents").select("direction_id").eq("actif", true);

  const svcCount = new Map<string, number>();
  services?.forEach((s) => svcCount.set(s.direction_id, (svcCount.get(s.direction_id) ?? 0) + 1));
  const agtCount = new Map<string, number>();
  agents?.forEach((a) => a.direction_id && agtCount.set(a.direction_id, (agtCount.get(a.direction_id) ?? 0) + 1));

  const canWrite = ["admin", "drh"].includes(profile.role);

  return (
    <div>
      <PageHeader
        title="Directions"
        description="Référentiel des directions de l'organisation, utilisé pour les analyses et tableaux de bord."
      />
      <ReferentielManager
        table="directions"
        path="/directions"
        title="Direction"
        canWrite={canWrite}
        fields={[
          { name: "code", label: "Code", type: "text", required: true },
          { name: "nom", label: "Nom", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
        ]}
        columns={[
          { key: "code", label: "Code" },
          { key: "nom", label: "Nom" },
          {
            key: "services",
            label: "Services",
            render: (row) => svcCount.get(row.id) ?? 0,
          },
          {
            key: "effectif",
            label: "Effectif",
            render: (row) => agtCount.get(row.id) ?? 0,
          },
        ]}
        rows={(directions as unknown as ReferentielRow[]) ?? []}
      />
    </div>
  );
}
