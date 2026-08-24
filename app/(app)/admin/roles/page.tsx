import { requireRole, ROLE_LABELS } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PermissionCheckbox } from "@/components/admin/permission-checkbox";
import type { UserRole } from "@/lib/database.types";

const ROLES: UserRole[] = ["admin", "drh", "responsable_rh", "chef_service", "direction_generale", "agent"];

export default async function RolesPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: permissions } = await supabase.from("role_permissions").select("*").order("module");

  const modules = Array.from(new Set((permissions ?? []).map((p) => p.module)));

  return (
    <div>
      <PageHeader
        title="Rôles et permissions"
        description="Matrice indicative des droits par rôle et par module. Le contrôle d'accès effectif est appliqué au niveau de la base de données (RLS)."
      />

      {ROLES.map((role) => {
        const rolePerms = (permissions ?? []).filter((p) => p.role === role);
        if (rolePerms.length === 0) return null;
        return (
          <Card key={role} className="mb-5">
            <CardHeader
              title={ROLE_LABELS[role]}
              description={`Périmètre : ${rolePerms[0]?.perimetre ?? "tous"}`}
              action={<Badge tone="primary">{role}</Badge>}
            />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-2">Module</th>
                      <th className="px-4 py-2 text-center">Voir</th>
                      <th className="px-4 py-2 text-center">Créer</th>
                      <th className="px-4 py-2 text-center">Modifier</th>
                      <th className="px-4 py-2 text-center">Supprimer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {modules
                      .map((m) => rolePerms.find((p) => p.module === m))
                      .filter((p): p is NonNullable<typeof p> => !!p)
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-2 capitalize">{p.module}</td>
                          <td className="px-4 py-2 text-center">
                            <PermissionCheckbox id={p.id} field="peut_voir" value={p.peut_voir} />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <PermissionCheckbox id={p.id} field="peut_creer" value={p.peut_creer} />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <PermissionCheckbox id={p.id} field="peut_modifier" value={p.peut_modifier} />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <PermissionCheckbox id={p.id} field="peut_supprimer" value={p.peut_supprimer} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
