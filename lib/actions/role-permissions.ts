"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function togglePermission(
  id: string,
  field: "peut_voir" | "peut_creer" | "peut_modifier" | "peut_supprimer",
  value: boolean
) {
  await requireRole("admin");
  const supabase = await createClient();
  await supabase.from("role_permissions").update({ [field]: value }).eq("id", id);
  revalidatePath("/admin/roles");
}
