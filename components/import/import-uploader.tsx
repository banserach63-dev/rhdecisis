"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { importAgentsRows, type ImportSummary } from "@/lib/actions/import";

const TEMPLATE_COLUMNS = [
  "matricule", "nom", "prenom", "sexe", "date_naissance", "date_recrutement",
  "date_prise_fonction", "direction_code", "service_code", "grade_code",
  "categorie_code", "statut_code", "email", "telephone", "lieu_affectation",
];

export function ImportUploader() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | { error: string } | null>(null);
  const router = useRouter();

  function handleFile(file: File) {
    setFileName(file.name);
    setSummary(null);
    const isCsv = file.name.toLowerCase().endsWith(".csv");
    setFormat(isCsv ? "csv" : "xlsx");

    if (isCsv) {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase(),
        complete: (res) => setRows(res.data),
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target?.result, { type: "binary" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "", raw: false });
        setRows(json.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.trim().toLowerCase(), String(v)]))));
      };
      reader.readAsBinaryString(file);
    }
  }

  async function submit() {
    setLoading(true);
    const res = await importAgentsRows(fileName, format, rows);
    setSummary(res);
    setLoading(false);
    router.refresh();
  }

  function downloadTemplate() {
    const csv = TEMPLATE_COLUMNS.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modele_import_agents.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-surface-muted px-4 py-3 text-sm text-muted hover:border-primary">
          <Upload className="h-4 w-4" />
          Sélectionner un fichier CSV ou Excel
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
        <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          <Download className="h-3.5 w-3.5" /> Télécharger le modèle CSV
        </button>
      </div>

      {fileName && (
        <div className="flex items-center gap-2 text-sm text-foreground">
          <FileSpreadsheet className="h-4 w-4 text-muted" />
          {fileName} — {rows.length} ligne(s) détectée(s)
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-surface-muted">
              <tr>
                {Object.keys(rows[0]).map((k) => (
                  <th key={k} className="px-2 py-1.5 text-left font-medium">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.slice(0, 5).map((r, i) => (
                <tr key={i}>
                  {Object.keys(rows[0]).map((k) => (
                    <td key={k} className="px-2 py-1.5">
                      {r[k]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 5 && <div className="px-2 py-1.5 text-xs text-muted">… et {rows.length - 5} ligne(s) supplémentaire(s)</div>}
        </div>
      )}

      {rows.length > 0 && (
        <Button onClick={submit} disabled={loading}>
          {loading ? "Importation en cours…" : `Importer ${rows.length} ligne(s)`}
        </Button>
      )}

      {summary && "error" in summary && <p className="text-sm text-danger">{summary.error}</p>}
      {summary && "succes" in summary && (
        <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
          <p>
            <strong>{summary.succes}</strong> / {summary.total} ligne(s) importée(s) avec succès.
          </p>
          {summary.erreurs.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-danger">{summary.erreurs.length} erreur(s) :</p>
              <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto text-xs text-danger">
                {summary.erreurs.map((e, i) => (
                  <li key={i}>
                    Ligne {e.line} ({e.matricule || "?"}) : {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
