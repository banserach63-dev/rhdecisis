import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { UserForm } from "@/components/admin/user-form";
import { UserRow } from "@/components/admin/user-row";

export default async function UtilisateursPage() {
  await requireRole("admin");
  const admin = createAdminClient();
  const supabase = await createClient();

  const [profilesRes, directionsRes, servicesRes, agentsRes] = await Promise.all([
    admin.from("profiles").select("*, directions(nom), services(nom)").order("created_at", { ascending: false }),
    supabase.from("directions").select("id, nom").eq("actif", true).order("nom"),
    supabase.from("services").select("id, nom").eq("actif", true).order("nom"),
    supabase.from("agents").select("id, nom, prenom, matricule").eq("actif", true).order("nom"),
  ]);

  return (
    <div>
      <PageHeader title="Gestion des utilisateurs" description="Créer et gérer les comptes d'accès à la plateforme, leur rôle et leur périmètre." />

      <Card className="mb-6">
        <CardHeader title="Nouvel utilisateur" />
        <CardBody>
          <UserForm
            directions={directionsRes.data ?? []}
            services={servicesRes.data ?? []}
            agents={agentsRes.data?.map((a) => ({ id: a.id, label: `${a.matricule} — ${a.prenom} ${a.nom}` })) ?? []}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Comptes existants" />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Périmètre</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(profilesRes.data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted">
                      Aucun utilisateur.
                    </td>
                  </tr>
                )}
                {(profilesRes.data ?? []).map((p) => (
                  <UserRow key={p.id} profile={p} directions={directionsRes.data ?? []} services={servicesRes.data ?? []} />
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
