import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScanButton } from "@/components/qualite/scan-button";
import { ResolveButton } from "@/components/qualite/resolve-button";
import { formatDateTime, formatNumber } from "@/lib/format";

const GRAVITE_TONE: Record<string, "danger" | "warning" | "default"> = {
  haute: "danger",
  moyenne: "warning",
  basse: "default",
};

function ScoreGauge({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0;
  const tone = v >= 85 ? "success" : v >= 60 ? "warning" : "danger";
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-2xl font-semibold">{formatNumber(v, 1)}</span>
        <span className="text-xs text-muted">/ 100</span>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-surface-muted">
        <div
          className={`h-1.5 rounded-full ${tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-danger"}`}
          style={{ width: `${Math.min(100, v)}%` }}
        />
      </div>
    </div>
  );
}

export default async function QualitePage() {
  await requireRole("admin", "drh", "responsable_rh");
  const supabase = await createClient();

  const { data: lastScan } = await supabase
    .from("quality_scans")
    .select("*")
    .order("date_scan", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: anomalies } = await supabase
    .from("quality_anomalies")
    .select("*, agents(nom, prenom)")
    .eq("statut", "ouverte")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <PageHeader
        title="Qualité des données"
        description="Contrôle de complétude, cohérence, unicité et actualisation des données RH avant exploitation."
        action={<ScanButton />}
      />

      {!lastScan ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">
              Aucun contrôle n&rsquo;a encore été exécuté. Lancez un contrôle qualité pour obtenir le score global et la
              liste des anomalies détectées.
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="mb-2 text-xs text-muted">Dernier contrôle : {formatDateTime(lastScan.date_scan)}</div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-6">
            <ScoreGauge label="Score global" value={lastScan.score_global} />
            <ScoreGauge label="Complétude" value={lastScan.completude} />
            <ScoreGauge label="Cohérence" value={lastScan.coherence} />
            <ScoreGauge label="Unicité" value={lastScan.unicite} />
            <ScoreGauge label="Actualisation" value={lastScan.actualisation} />
          </div>

          <Card>
            <CardHeader title="Anomalies détectées" description={`${anomalies?.length ?? 0} anomalie(s) ouverte(s)`} />
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Gravité</th>
                      <th className="px-4 py-3">Agent</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(anomalies ?? []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted">
                          Aucune anomalie ouverte. 🎉
                        </td>
                      </tr>
                    )}
                    {(anomalies ?? []).map((a) => (
                      <tr key={a.id} className="hover:bg-surface-muted/60">
                        <td className="px-4 py-3 text-xs capitalize">{a.type_anomalie.replace(/_/g, " ")}</td>
                        <td className="px-4 py-3">
                          <Badge tone={GRAVITE_TONE[a.gravite] ?? "default"}>{a.gravite}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {a.agent_id ? (
                            <Link href={`/agents/${a.agent_id}`} className="text-primary hover:underline">
                              {a.agents ? `${a.agents.prenom} ${a.agents.nom}` : "Voir fiche"}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">{a.description}</td>
                        <td className="px-4 py-3 text-right">
                          <ResolveButton id={a.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
