import Link from "next/link";
import { UserCog, KeyRound, Building2, ShieldAlert, ScrollText, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

export default async function AdminPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: recentAudit } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(15);

  const cards = [
    { href: "/admin/utilisateurs", title: "Utilisateurs", desc: "Créer et gérer les comptes d'accès", icon: UserCog },
    { href: "/admin/roles", title: "Rôles & permissions", desc: "Matrice des droits par rôle", icon: KeyRound },
    { href: "/directions", title: "Référentiels", desc: "Directions, services, grades, catégories, statuts", icon: Building2 },
    { href: "/alertes", title: "Règles d'alerte", desc: "Seuils et niveaux d'alerte", icon: ShieldAlert },
    { href: "/admin/assistant-ia", title: "Assistant IA", desc: "Fournisseur IA (Claude, OpenAI, DeepSeek) et clé API", icon: Sparkles },
  ];

  return (
    <div>
      <PageHeader title="Administration" description="Gestion des utilisateurs, des rôles, des permissions et des référentiels de l'application." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardBody>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <c.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold">{c.title}</h3>
                <p className="mt-1 text-xs text-muted">{c.desc}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardBody>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <ScrollText className="h-4 w-4" /> Journal d&rsquo;audit récent
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="border-b border-border px-2 py-2">Table</th>
                  <th className="border-b border-border px-2 py-2">Action</th>
                  <th className="border-b border-border px-2 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(recentAudit ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-center text-muted">
                      Aucune activité enregistrée.
                    </td>
                  </tr>
                )}
                {(recentAudit ?? []).map((a) => (
                  <tr key={a.id}>
                    <td className="px-2 py-2">{a.table_name}</td>
                    <td className="px-2 py-2 uppercase text-xs">{a.action}</td>
                    <td className="px-2 py-2 text-xs text-muted">{formatDateTime(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
