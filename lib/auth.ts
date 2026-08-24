import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/database.types";
export { ROLE_LABELS, MANAGER_ROLES, READ_ALL_ROLES } from "@/lib/roles";

/**
 * Returns the current session's profile, or null if not authenticated.
 * Memoized per request so it can be called from many Server Components
 * without duplicating the Supabase round-trip.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return profile as Profile | null;
});

/** Redirects to /login if there is no authenticated, active profile. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || !profile.actif) {
    redirect("/login");
  }
  return profile;
}

/** Redirects to /dashboard (with a denial flag) if the role isn't allowed. */
export async function requireRole(...roles: UserRole[]): Promise<Profile> {
  const profile = await requireProfile();
  if (!roles.includes(profile.role)) {
    redirect("/dashboard?acces=refuse");
  }
  return profile;
}

