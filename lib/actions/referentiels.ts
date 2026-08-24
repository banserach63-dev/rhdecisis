"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

const ALLOWED_TABLES = [
  "directions",
  "services",
  "fonctions",
  "categories",
  "grades",
  "statuts",
  "types_absence",
  "types_mouvement",
  "organismes_formation",
  "competences",
] as const;

type AllowedTable = (typeof ALLOWED_TABLES)[number];

function assertTable(table: string): asserts table is AllowedTable {
  if (!ALLOWED_TABLES.includes(table as AllowedTable)) {
    throw new Error(`Table de référentiel non autorisée : ${table}`);
  }
}

export type ReferentielActionState = { error?: string; success?: boolean } | undefined;

export async function upsertReferentielRow(
  table: string,
  values: Record<string, unknown>,
  path: string,
  id?: string
): Promise<ReferentielActionState> {
  assertTable(table);
  await requireRole("admin", "drh", "responsable_rh");

  const supabase = await createClient();
  const payload = { ...values };
  Object.keys(payload).forEach((k) => {
    if (payload[k] === "") payload[k] = null;
  });

  const query = id
    ? supabase.from(table).update(payload).eq("id", id)
    : supabase.from(table).insert(payload);

  const { error } = await query;
  if (error) return { error: error.message };

  revalidatePath(path);
  return { success: true };
}

export async function deleteReferentielRow(table: string, id: string, path: string): Promise<ReferentielActionState> {
  assertTable(table);
  await requireRole("admin", "drh");

  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(path);
  return { success: true };
}

export async function toggleActifRow(table: string, id: string, actif: boolean, path: string): Promise<ReferentielActionState> {
  assertTable(table);
  await requireRole("admin", "drh", "responsable_rh");

  const supabase = await createClient();
  const { error } = await supabase.from(table).update({ actif }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(path);
  return { success: true };
}
