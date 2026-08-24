import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ReferentielManager } from "@/components/referentiels/referentiel-manager";

export default async function ServicesPage() {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service");
  const supabase = await createClient();

  const { data: services } = await supabase.from("services").select("*, directions(nom)").order("nom");
  const { data: directions } = await supabase.from("directions").select("id, nom").eq("actif", true).order("nom");
  const { data: agents } = await supabase.from("agents").select("service_id").eq("actif", true);

  const agtCount = new Map<string, number>();
  agents?.forEach((a) => a.service_id && agtCount.set(a.service_id, (agtCount.get(a.service_id) ?? 0) + 1));

  const canWrite = ["admin", "drh", "responsable_rh"].includes(profile.role);

  const rows = (services ?? []).map((s) => ({
    ...s,
    direction_nom: (s as { directions?: { nom: string } | null }).directions?.nom ?? "—",
  }));

  return (
    <div>
      <PageHeader
        title="Services"
        description="Référentiel des services, rattachés à une direction. Utilisé pour les analyses par périmètre."
      />
      <ReferentielManager
        table="services"
        path="/services"
        title="Service"
        canWrite={canWrite}
        fields={[
          { name: "code", label: "Code", type: "text", required: true },
          { name: "nom", label: "Nom", type: "text", required: true },
          {
            name: "direction_id",
            label: "Direction",
            type: "select",
            required: true,
            options: directions?.map((d) => ({ value: d.id, label: d.nom })) ?? [],
          },
        ]}
        columns={[
          { key: "code", label: "Code" },
          { key: "nom", label: "Nom" },
          { key: "direction_nom", label: "Direction" },
          { key: "effectif", label: "Effectif", render: (row) => agtCount.get(row.id) ?? 0 },
        ]}
        rows={rows}
      />
    </div>
  );
}
