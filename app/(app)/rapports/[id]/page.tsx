import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PrintButton } from "@/components/rapports/print-button";
import { formatDateTime, formatCurrency, formatNumber, formatPercent } from "@/lib/format";

const TYPE_LABELS: Record<string, string> = {
  effectifs: "Rapport Effectifs",
  mouvements: "Rapport Mouvements",
  absences: "Rapport Absences",
  formations: "Rapport Formations",
  kpi: "Rapport KPI RH",
};

export default async function RapportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("admin", "drh", "responsable_rh", "chef_service", "direction_generale");
  const supabase = await createClient();
  const { data: rapport } = await supabase.from("rapports").select("*").eq("id", id).maybeSingle();
  if (!rapport) notFound();

  const contenu = (rapport.contenu ?? {}) as Record<string, unknown>;
  const params_ = (rapport.parametres ?? {}) as { date_debut?: string; date_fin?: string };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={rapport.titre}
        description={`${TYPE_LABELS[rapport.type] ?? rapport.type} · Période : ${params_.date_debut ?? "—"} → ${params_.date_fin ?? "—"} · Généré le ${formatDateTime(rapport.created_at)}`}
        action={<PrintButton />}
      />

      <Card>
        <CardHeader title="Synthèse" />
        <CardBody className="space-y-4">
          {rapport.type === "effectifs" && (
            <>
              <SummaryGrid
                items={[
                  ["Effectif total", formatNumber(contenu.total as number)],
                  ["Hommes", formatNumber(contenu.hommes as number)],
                  ["Femmes", formatNumber(contenu.femmes as number)],
                ]}
              />
              <ListTable rows={(contenu.parDirection as { name: string; value: number }[]) ?? []} headers={["Direction", "Effectif"]} />
            </>
          )}
          {rapport.type === "mouvements" && (
            <>
              <SummaryGrid
                items={[
                  ["Mouvements", formatNumber(contenu.total as number)],
                  ["Entrées", formatNumber(contenu.entrees as number)],
                  ["Sorties", formatNumber(contenu.sorties as number)],
                ]}
              />
              <ListTable
                rows={(contenu.liste as { date: string; agent: string; type: string; motif: string }[]) ?? []}
                headers={["Date", "Agent", "Type", "Motif"]}
                keys={["date", "agent", "type", "motif"]}
              />
            </>
          )}
          {rapport.type === "absences" && (
            <>
              <SummaryGrid
                items={[
                  ["Absences", formatNumber(contenu.total as number)],
                  ["Jours cumulés", formatNumber(contenu.jours as number, 1)],
                  ["Taux d'absentéisme", formatPercent(contenu.tauxAbsenteisme as number)],
                ]}
              />
              <ListTable
                rows={(contenu.liste as { agent: string; service: string; type: string; jours: number; statut: string }[]) ?? []}
                headers={["Agent", "Service", "Type", "Jours", "Statut"]}
                keys={["agent", "service", "type", "jours", "statut"]}
              />
            </>
          )}
          {rapport.type === "formations" && (
            <>
              <SummaryGrid
                items={[
                  ["Formations", formatNumber(contenu.total as number)],
                  ["Coût total", formatCurrency(contenu.coutTotal as number)],
                  ["Participants", formatNumber(contenu.participants as number)],
                ]}
              />
              <ListTable
                rows={(contenu.liste as { titre: string; cout: number; duree: number; statut: string; participants: number }[]) ?? []}
                headers={["Formation", "Coût", "Durée (h)", "Statut", "Participants"]}
                keys={["titre", "cout", "duree", "statut", "participants"]}
              />
            </>
          )}
          {rapport.type === "kpi" && (
            <SummaryGrid
              items={[
                ["Effectif", formatNumber(contenu.effectif as number)],
                ["Turnover", formatPercent(contenu.turnover as number)],
                ["Absentéisme", formatPercent(contenu.absenteisme as number)],
                ["Masse salariale", formatCurrency(contenu.masseSalariale as number)],
                ["Taux de couverture formation", formatPercent(contenu.tauxCouvertureFormation as number)],
              ]}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function SummaryGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-border p-3">
          <div className="text-xs text-muted">{label}</div>
          <div className="mt-1 text-lg font-semibold">{value}</div>
        </div>
      ))}
    </div>
  );
}

function ListTable({
  rows,
  headers,
  keys,
}: {
  rows: Record<string, unknown>[] | { name: string; value: number }[];
  headers: string[];
  keys?: string[];
}) {
  const effectiveKeys = keys ?? ["name", "value"];
  if (!rows || rows.length === 0) return <p className="text-sm text-muted">Aucune donnée détaillée.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-medium uppercase tracking-wide text-muted">
          <tr>
            {headers.map((h) => (
              <th key={h} className="border-b border-border px-2 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i}>
              {effectiveKeys.map((k) => (
                <td key={k} className="px-2 py-2">
                  {String((row as Record<string, unknown>)[k] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
