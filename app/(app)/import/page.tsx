import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportUploader } from "@/components/import/import-uploader";
import { formatDateTime } from "@/lib/format";

const STATUT_TONE: Record<string, "success" | "danger" | "warning" | "info"> = {
  termine: "success",
  erreur: "danger",
  partiel: "warning",
  en_cours: "info",
};

export default async function ImportPage() {
  await requireRole("admin", "drh");
  const supabase = await createClient();
  const { data: jobs } = await supabase.from("import_jobs").select("*").order("created_at", { ascending: false }).limit(20);

  return (
    <div>
      <PageHeader
        title="Importation des données"
        description="Importer les données RH depuis des fichiers Excel ou CSV. Les données importées sont soumises aux contrôles de qualité."
      />

      <Card className="mb-6">
        <CardHeader title="Importer des agents" description="Format attendu : colonnes matricule, nom, prénom, sexe, dates, codes des référentiels." />
        <CardBody>
          <ImportUploader />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Historique des imports" />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Fichier</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Lignes</th>
                  <th className="px-4 py-3">Succès</th>
                  <th className="px-4 py-3">Erreurs</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(jobs ?? []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted">
                      Aucun import réalisé.
                    </td>
                  </tr>
                )}
                {(jobs ?? []).map((j) => (
                  <tr key={j.id}>
                    <td className="px-4 py-3">{j.nom_fichier}</td>
                    <td className="px-4 py-3 text-muted">{j.type_import}</td>
                    <td className="px-4 py-3">{j.nb_lignes}</td>
                    <td className="px-4 py-3 text-success">{j.nb_succes}</td>
                    <td className="px-4 py-3 text-danger">{j.nb_erreurs}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUT_TONE[j.statut]}>{j.statut}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDateTime(j.created_at)}</td>
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
