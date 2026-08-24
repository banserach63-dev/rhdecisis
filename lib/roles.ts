import type { UserRole } from "@/lib/database.types";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  drh: "Direction des Ressources Humaines",
  responsable_rh: "Responsable RH",
  chef_service: "Chef de service",
  direction_generale: "Direction générale",
  agent: "Agent",
};

export const MANAGER_ROLES: UserRole[] = ["admin", "drh", "responsable_rh"];
export const READ_ALL_ROLES: UserRole[] = ["admin", "drh", "direction_generale"];
