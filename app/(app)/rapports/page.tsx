import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RapportForm } from "@/components/rapports/rapport-form";
import { formatDateTime } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  effectifs: "Effectifs",
  mouvements: "Mouvements",
  absences: "Absences",
  formations: "Formations",
  kpi: "KPI RH",
};

export default async function RapportsPage() {
  const profile = await requireRole("admin", "drh", "responsable_rh", "chef_service", "direction_generale");
  const supabase = await createClient();
  const { data: rapports } = await supabase.from("rapports").select("*").order("created_at", { ascending: false }).limit(50);
  const canGenerate = ["admin", "drh", "responsable_rh", "chef_service"].includes(profile.role);

  return (
    <div>
      <PageHeader title="Rapports" description="Génération de rapports RH à partir des données disponibles : indicateurs, statistiques, tableaux." />

      {canGenerate && (
        <Card className="mb-6">
          <CardHeader title="Générer un nouveau rapport" />
          <CardBody>
            <RapportForm />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Rapports générés" />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Généré le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(rapports ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-muted">
                      Aucun rapport généré.
                    </td>
                  </tr>
                )}
                {(rapports ?? []).map((r) => (
                  <tr key={r.id} className="hover:bg-surface-muted/60">
                    <td className="px-4 py-3">
                      <Link href={`/rapports/${r.id}`} className="font-medium text-primary hover:underline">
                        {r.titre}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="info">{TYPE_LABELS[r.type] ?? r.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDateTime(r.created_at)}</td>
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
