import type { UserRole } from "@/lib/database.types";

export interface NavItem {
  href: string;
  label: string;
  icon: string; // lucide-react icon name
  roles?: UserRole[]; // omit = all roles
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const ALL: UserRole[] = ["admin", "drh", "responsable_rh", "chef_service", "direction_generale", "agent"];
const RH: UserRole[] = ["admin", "drh", "responsable_rh", "chef_service"];
const RH_DG: UserRole[] = ["admin", "drh", "responsable_rh", "chef_service", "direction_generale"];
const PILOTAGE: UserRole[] = ["admin", "drh", "direction_generale", "responsable_rh"];

export const NAV: NavGroup[] = [
  {
    label: "Tableau de bord",
    items: [
      { href: "/dashboard", label: "Vue RH", icon: "LayoutDashboard", roles: ALL },
    ],
  },
  {
    label: "Pilotage",
    items: [
      { href: "/effectifs", label: "Effectifs", icon: "BarChart3", roles: RH_DG },
      { href: "/mouvements", label: "Mouvements", icon: "ArrowLeftRight", roles: RH },
      { href: "/carrieres", label: "Carrières", icon: "TrendingUp", roles: RH_DG },
    ],
  },
  {
    label: "Gestion RH",
    items: [
      { href: "/agents", label: "Agents", icon: "Users", roles: RH_DG },
      { href: "/absences", label: "Absences & congés", icon: "CalendarOff", roles: RH_DG },
      { href: "/formations", label: "Formations", icon: "GraduationCap", roles: RH_DG },
      { href: "/performances", label: "Performances", icon: "Target", roles: RH_DG },
    ],
  },
  {
    label: "Analytique",
    items: [
      { href: "/analyse", label: "Analyses", icon: "LineChart", roles: PILOTAGE },
      { href: "/kpi", label: "Indicateurs", icon: "Gauge", roles: PILOTAGE },
      { href: "/alertes", label: "Alertes", icon: "BellRing", roles: RH_DG },
      { href: "/rapports", label: "Rapports", icon: "FileText", roles: RH_DG },
      { href: "/assistant-ia", label: "Assistant IA", icon: "Sparkles", roles: PILOTAGE },
    ],
  },
  {
    label: "Référentiels",
    items: [
      { href: "/directions", label: "Directions", icon: "Building2", roles: ["admin", "drh"] },
      { href: "/services", label: "Services", icon: "Building", roles: RH },
      { href: "/grades", label: "Grades", icon: "Award", roles: ["admin", "drh"] },
      { href: "/categories", label: "Catégories", icon: "Layers", roles: ["admin", "drh"] },
      { href: "/statuts", label: "Statuts", icon: "BadgeCheck", roles: ["admin", "drh"] },
    ],
  },
  {
    label: "Données",
    items: [
      { href: "/qualite", label: "Qualité des données", icon: "ShieldCheck", roles: ["admin", "drh", "responsable_rh"] },
      { href: "/import", label: "Importation", icon: "Upload", roles: ["admin", "drh"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin", label: "Administration", icon: "Settings", roles: ["admin"] },
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "UserCog", roles: ["admin"] },
      { href: "/admin/roles", label: "Rôles & permissions", icon: "KeyRound", roles: ["admin"] },
      { href: "/admin/assistant-ia", label: "Assistant IA", icon: "Sparkles", roles: ["admin"] },
    ],
  },
  {
    label: "Mon espace",
    items: [{ href: "/mon-profil", label: "Ma fiche", icon: "UserRound", roles: ["agent"] }],
  },
];

export function navForRole(role: UserRole): NavGroup[] {
  return NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
