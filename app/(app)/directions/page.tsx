import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ReferentielManager, type ReferentielRow } from "@/components/referentiels/referentiel-manager";

export default async function DirectionsPage() {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service", "direction_generale");
  const supabase = await createClient();

  const { data: directions } = await supabase
    .from("directions")
    .select("*, agents:responsable_agent_id(nom, prenom), natures_structure(nom)")
    .order("nom");

  const { data: services } = await supabase.from("services").select("direction_id");
  const { data: agents } = await supabase.from("agents").select("direction_id").eq("actif", true);
  const { data: naturesStructure } = await supabase.from("natures_structure").select("id, nom").eq("actif", true).order("nom");

  const svcCount = new Map<string, number>();
  services?.forEach((s) => svcCount.set(s.direction_id, (svcCount.get(s.direction_id) ?? 0) + 1));
  const agtCount = new Map<string, number>();
  agents?.forEach((a) => a.direction_id && agtCount.set(a.direction_id, (agtCount.get(a.direction_id) ?? 0) + 1));

  const rows = (directions ?? []).map((d) => ({
    ...d,
    nature_structure_nom: (d as unknown as { natures_structure?: { nom: string } | null }).natures_structure?.nom ?? "—",
  }));

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
          {
            name: "nature_structure_id",
            label: "Nature de structure",
            type: "select",
            options: naturesStructure?.map((n) => ({ value: n.id, label: n.nom })) ?? [],
          },
          { name: "description", label: "Description", type: "textarea" },
        ]}
        columns={[
          { key: "code", label: "Code" },
          { key: "nom", label: "Nom" },
          { key: "nature_structure_nom", label: "Nature de structure" },
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
        rows={(rows as unknown as ReferentielRow[]) ?? []}
      />
    </div>
  );
}
