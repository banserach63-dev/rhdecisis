import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { navForRole } from "@/lib/nav";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ count }, directionsRes, servicesRes, statutsRes] = await Promise.all([
    supabase.from("alertes").select("id", { count: "exact", head: true }).in("statut", ["nouvelle"]),
    supabase.from("directions").select("id, nom").eq("actif", true).order("nom"),
    supabase.from("services").select("id, nom, direction_id").order("nom"),
    supabase.from("statuts").select("id, nom").order("nom"),
  ]);

  const showAssistant = ["admin", "drh", "direction_generale", "responsable_rh"].includes(profile.role);

  return (
    <AppShell
      groups={navForRole(profile.role)}
      profile={profile}
      alertesNonLues={count ?? 0}
      showAssistant={showAssistant}
      filterOptions={{
        directions: directionsRes.data ?? [],
        services: servicesRes.data ?? [],
        statuts: statutsRes.data ?? [],
      }}
    >
      {children}
    </AppShell>
  );
}
