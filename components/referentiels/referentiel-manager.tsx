"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { upsertReferentielRow, deleteReferentielRow, toggleActifRow } from "@/lib/actions/referentiels";

export interface ReferentielField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "checkbox";
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface ReferentielRow {
  id: string;
  actif?: boolean;
  [key: string]: unknown;
}

export function ReferentielManager({
  table,
  path,
  title,
  fields,
  rows,
  columns,
  canWrite,
}: {
  table: string;
  path: string;
  title: string;
  fields: ReferentielField[];
  rows: ReferentielRow[];
  columns: { key: string; label: string; render?: (row: ReferentielRow) => React.ReactNode }[];
  canWrite: boolean;
}) {
  const [editing, setEditing] = useState<ReferentielRow | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function closeForm() {
    setEditing(null);
    setError(null);
  }

  function submit(formData: FormData) {
    const values: Record<string, unknown> = {};
    for (const f of fields) {
      if (f.type === "checkbox") {
        values[f.name] = formData.get(f.name) === "on";
      } else if (f.type === "number") {
        const v = formData.get(f.name);
        values[f.name] = v ? Number(v) : null;
      } else {
        values[f.name] = formData.get(f.name);
      }
    }
    const id = editing && editing !== "new" ? editing.id : undefined;
    startTransition(async () => {
      const res = await upsertReferentielRow(table, values, path, id);
      if (res?.error) {
        setError(res.error);
      } else {
        closeForm();
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Confirmez-vous la suppression de cet élément ?")) return;
    startTransition(async () => {
      await deleteReferentielRow(table, id, path);
    });
  }

  function toggle(row: ReferentielRow) {
    startTransition(async () => {
      await toggleActifRow(table, row.id, !(row.actif ?? true), path);
    });
  }

  const activeEditing = editing === "new" ? null : editing;

  return (
    <div>
      {canWrite && (
        <div className="mb-4 flex justify-end">
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" /> Nouveau
          </Button>
        </div>
      )}

      {editing && (
        <div className="mb-5 rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {editing === "new" ? `Nouveau — ${title}` : `Modifier — ${title}`}
            </h3>
            <button onClick={closeForm} className="text-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form
            action={(fd) => submit(fd)}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {fields.map((f) => (
              <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                <Field label={f.label} required={f.required}>
                  {f.type === "select" ? (
                    <Select
                      name={f.name}
                      required={f.required}
                      defaultValue={activeEditing ? String(activeEditing[f.name] ?? "") : ""}
                    >
                      <option value="">— Sélectionner —</option>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  ) : f.type === "textarea" ? (
                    <Textarea
                      name={f.name}
                      rows={2}
                      defaultValue={activeEditing ? String(activeEditing[f.name] ?? "") : ""}
                    />
                  ) : f.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      name={f.name}
                      defaultChecked={activeEditing ? Boolean(activeEditing[f.name]) : true}
                      className="h-4 w-4"
                    />
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : "text"}
                      name={f.name}
                      required={f.required}
                      defaultValue={activeEditing ? String(activeEditing[f.name] ?? "") : ""}
                    />
                  )}
                </Field>
              </div>
            ))}
            {error && <p className="sm:col-span-2 text-xs text-danger">{error}</p>}
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={closeForm}>
                Annuler
              </Button>
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3">Statut</th>
              {canWrite && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-8 text-center text-muted">
                  Aucun élément enregistré.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-surface-muted/60">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <button onClick={() => canWrite && toggle(row)} disabled={!canWrite}>
                    <Badge tone={row.actif === false ? "default" : "success"}>
                      {row.actif === false ? "Inactif" : "Actif"}
                    </Badge>
                  </button>
                </td>
                {canWrite && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(row)}
                        className="rounded p-1.5 text-muted hover:bg-primary-soft hover:text-primary"
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(row.id)}
                        className="rounded p-1.5 text-muted hover:bg-danger-soft hover:text-danger"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
