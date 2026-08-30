// Hand-written types mirroring supabase/migrations/0001_init.sql.
// Kept intentionally close to the SQL schema so queries stay type-safe
// without depending on a live `supabase gen types` run.

export type UserRole =
  | "admin"
  | "drh"
  | "responsable_rh"
  | "chef_service"
  | "direction_generale"
  | "agent";

export type Sexe = "M" | "F";
export type AbsenceStatut = "demandee" | "validee" | "refusee" | "annulee";
export type MouvementSens = "entree" | "sortie" | "interne";
export type CarriereTypeEvenement =
  | "recrutement"
  | "affectation"
  | "avancement"
  | "promotion"
  | "mutation"
  | "nouvelle_responsabilite"
  | "retraite"
  | "depart";
export type AlerteNiveau = "critique" | "importante" | "qualite" | "information";
export type AlerteStatut = "nouvelle" | "vue" | "traitee" | "ignoree";
export type ImportType = "agents" | "mouvements" | "absences" | "formations" | "remunerations";
export type ImportStatut = "en_cours" | "termine" | "erreur" | "partiel";
export type DecisionStatut = "enregistree" | "en_cours" | "appliquee" | "annulee";
export type EvaluationStatut = "planifiee" | "en_cours" | "validee" | "cloturee";

export interface Direction {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  responsable_agent_id: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  direction_id: string;
  code: string;
  nom: string;
  chef_agent_id: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Fonction {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  actif: boolean;
  created_at: string;
}

export interface Categorie {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  ordre: number;
  actif: boolean;
  created_at: string;
}

export interface Grade {
  id: string;
  code: string;
  nom: string;
  categorie_id: string | null;
  echelon: string | null;
  actif: boolean;
  created_at: string;
}

export interface Statut {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  actif: boolean;
  created_at: string;
}

export interface TypeAbsence {
  id: string;
  code: string;
  nom: string;
  remunere: boolean;
  justificatif_requis: boolean;
  actif: boolean;
  created_at: string;
}

export interface TypeMouvement {
  id: string;
  code: string;
  nom: string;
  sens: MouvementSens;
  actif: boolean;
  created_at: string;
}

export interface OrganismeFormation {
  id: string;
  nom: string;
  contact: string | null;
  actif: boolean;
  created_at: string;
}

export interface Competence {
  id: string;
  code: string;
  nom: string;
  categorie: string | null;
  actif: boolean;
  created_at: string;
}

export interface Agent {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  sexe: Sexe;
  date_naissance: string;
  date_recrutement: string;
  date_prise_fonction: string | null;
  statut_id: string | null;
  categorie_id: string | null;
  grade_id: string | null;
  fonction_id: string | null;
  direction_id: string | null;
  service_id: string | null;
  lieu_affectation: string | null;
  situation_administrative: string | null;
  email: string | null;
  telephone: string | null;
  actif: boolean;
  date_sortie: string | null;
  motif_sortie: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentHistorique {
  id: string;
  agent_id: string;
  champ: string;
  ancienne_valeur: string | null;
  nouvelle_valeur: string | null;
  motif: string | null;
  date_effet: string;
  created_by: string | null;
  created_at: string;
}

export interface Mouvement {
  id: string;
  agent_id: string;
  type_mouvement_id: string;
  date_effet: string;
  direction_origine_id: string | null;
  service_origine_id: string | null;
  grade_origine_id: string | null;
  direction_destination_id: string | null;
  service_destination_id: string | null;
  grade_destination_id: string | null;
  motif: string | null;
  reference_decision: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CarriereEvenement {
  id: string;
  agent_id: string;
  type_evenement: CarriereTypeEvenement;
  date_evenement: string;
  description: string | null;
  grade_id: string | null;
  fonction_id: string | null;
  service_id: string | null;
  direction_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CarriereEcheance {
  id: string;
  agent_id: string;
  type_echeance: string;
  date_echeance: string;
  statut: string;
  description: string | null;
  created_at: string;
}

export interface Absence {
  id: string;
  agent_id: string;
  type_absence_id: string;
  date_debut: string;
  date_fin: string;
  nb_jours: number;
  justificatif_url: string | null;
  statut: AbsenceStatut;
  motif: string | null;
  validee_par: string | null;
  created_at: string;
  updated_at: string;
}

export interface Formation {
  id: string;
  titre: string;
  description: string | null;
  organisme_id: string | null;
  competence_id: string | null;
  cout: number;
  duree_heures: number | null;
  date_debut: string | null;
  date_fin: string | null;
  lieu: string | null;
  capacite: number | null;
  statut: string;
  created_at: string;
  updated_at: string;
}

export interface FormationParticipant {
  id: string;
  formation_id: string;
  agent_id: string;
  statut: string;
  resultat: string | null;
  note: number | null;
  created_at: string;
}

export interface AgentCompetence {
  id: string;
  agent_id: string;
  competence_id: string;
  niveau: number;
  date_acquisition: string | null;
  source: string;
  formation_id: string | null;
  created_at: string;
}

export interface CampagneEvaluation {
  id: string;
  nom: string;
  periode_debut: string;
  periode_fin: string;
  statut: EvaluationStatut;
  created_at: string;
}

export interface Objectif {
  id: string;
  agent_id: string;
  campagne_id: string | null;
  libelle: string;
  description: string | null;
  poids: number;
  cible: number | null;
  unite: string | null;
  created_at: string;
}

export interface Evaluation {
  id: string;
  agent_id: string;
  campagne_id: string | null;
  evaluateur_id: string | null;
  date_evaluation: string;
  note_globale: number | null;
  taux_atteinte: number | null;
  synthese: string | null;
  statut: EvaluationStatut;
  created_at: string;
  updated_at: string;
}

export interface EvaluationObjectif {
  id: string;
  evaluation_id: string;
  objectif_id: string;
  resultat: number | null;
  taux_atteinte: number | null;
  commentaire: string | null;
}

export interface Remuneration {
  id: string;
  agent_id: string;
  periode: string;
  salaire_base: number;
  primes: number;
  indemnites: number;
  total: number;
  created_at: string;
}

export interface QualityScan {
  id: string;
  lance_par: string | null;
  date_scan: string;
  score_global: number | null;
  completude: number | null;
  coherence: number | null;
  unicite: number | null;
  actualisation: number | null;
  nb_anomalies: number;
  created_at: string;
}

export interface QualityAnomalie {
  id: string;
  scan_id: string | null;
  type_anomalie: string;
  gravite: string;
  table_concernee: string;
  record_id: string | null;
  agent_id: string | null;
  description: string;
  statut: string;
  created_at: string;
  resolved_at: string | null;
}

export interface ImportJob {
  id: string;
  nom_fichier: string;
  type_import: ImportType;
  format: string;
  statut: ImportStatut;
  nb_lignes: number;
  nb_succes: number;
  nb_erreurs: number;
  erreurs: unknown;
  importe_par: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface AlertRule {
  id: string;
  code: string;
  nom: string;
  niveau: AlerteNiveau;
  description: string | null;
  seuil: number | null;
  actif: boolean;
  parametres: Record<string, unknown>;
}

export interface Alerte {
  id: string;
  rule_code: string | null;
  niveau: AlerteNiveau;
  titre: string;
  description: string | null;
  agent_id: string | null;
  direction_id: string | null;
  service_id: string | null;
  statut: AlerteStatut;
  donnees: Record<string, unknown>;
  created_at: string;
  vue_par: string | null;
  vue_at: string | null;
  traitee_par: string | null;
  traitee_at: string | null;
}

export interface Rapport {
  id: string;
  titre: string;
  type: string;
  description: string | null;
  parametres: Record<string, unknown>;
  format: string;
  genere_par: string | null;
  contenu: unknown;
  created_at: string;
}

export interface Decision {
  id: string;
  titre: string;
  description: string | null;
  type: string;
  agent_id: string | null;
  direction_id: string | null;
  service_id: string | null;
  decideur_id: string | null;
  date_decision: string;
  statut: DecisionStatut;
  suivi: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string | null;
  action: string;
  ancien: unknown;
  nouveau: unknown;
  user_id: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  agent_id: string | null;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  direction_id: string | null;
  service_id: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface RolePermission {
  id: string;
  role: UserRole;
  module: string;
  peut_voir: boolean;
  peut_creer: boolean;
  peut_modifier: boolean;
  peut_supprimer: boolean;
  perimetre: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  titre: string;
  created_at: string;
  updated_at: string;
}

export interface AiMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  contenu: string;
  donnees_utilisees: unknown;
  created_at: string;
}

export type AiProvider = "anthropic" | "openai" | "deepseek";

export interface AiSettings {
  id: number;
  provider: AiProvider;
  model: string | null;
  api_key: string | null;
  updated_by: string | null;
  updated_at: string;
}

// Note: these domain types are applied manually at each Supabase call site
// (e.g. `data as Agent[]`) rather than fed as the client's generic Database
// parameter — see lib/supabase/server.ts for why.
