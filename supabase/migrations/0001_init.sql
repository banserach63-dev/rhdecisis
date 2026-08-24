-- ============================================================================
-- SARH-AD — Systeme Analytique RH d'Aide a la Decision
-- Migration initiale : schema complet, RLS, fonctions KPI, triggers d'audit
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

create type user_role as enum (
  'admin',
  'drh',
  'responsable_rh',
  'chef_service',
  'direction_generale',
  'agent'
);

create type sexe_enum as enum ('M', 'F');

create type statut_generique as enum ('actif', 'inactif');

create type absence_statut as enum ('demandee', 'validee', 'refusee', 'annulee');

create type mouvement_sens as enum ('entree', 'sortie', 'interne');

create type carriere_type_evenement as enum (
  'recrutement', 'affectation', 'avancement', 'promotion',
  'mutation', 'nouvelle_responsabilite', 'retraite', 'depart'
);

create type alerte_niveau as enum ('critique', 'importante', 'qualite', 'information');

create type alerte_statut as enum ('nouvelle', 'vue', 'traitee', 'ignoree');

create type import_type as enum ('agents', 'mouvements', 'absences', 'formations', 'remunerations');

create type import_statut as enum ('en_cours', 'termine', 'erreur', 'partiel');

create type decision_statut as enum ('enregistree', 'en_cours', 'appliquee', 'annulee');

create type evaluation_statut as enum ('planifiee', 'en_cours', 'validee', 'cloturee');

-- ============================================================================
-- 2. FONCTION UTILITAIRE updated_at
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 3. REFERENTIELS
-- ============================================================================

create table directions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  description text,
  responsable_agent_id uuid,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  direction_id uuid not null references directions(id) on delete restrict,
  code text unique not null,
  nom text not null,
  chef_agent_id uuid,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table fonctions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  description text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  description text,
  ordre int not null default 0,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table grades (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  categorie_id uuid references categories(id) on delete set null,
  echelon text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table statuts (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  description text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table types_absence (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  remunere boolean not null default true,
  justificatif_requis boolean not null default false,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table types_mouvement (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  sens mouvement_sens not null,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table organismes_formation (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  contact text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table competences (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  categorie text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 4. AGENTS (fiche + historique)
-- ============================================================================

create table agents (
  id uuid primary key default gen_random_uuid(),
  matricule text unique not null,
  nom text not null,
  prenom text not null,
  sexe sexe_enum not null,
  date_naissance date not null,
  date_recrutement date not null,
  date_prise_fonction date,
  statut_id uuid references statuts(id) on delete set null,
  categorie_id uuid references categories(id) on delete set null,
  grade_id uuid references grades(id) on delete set null,
  fonction_id uuid references fonctions(id) on delete set null,
  direction_id uuid references directions(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  lieu_affectation text,
  situation_administrative text,
  email text,
  telephone text,
  actif boolean not null default true,
  date_sortie date,
  motif_sortie text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_sortie check (actif = true or date_sortie is not null)
);

create index idx_agents_direction on agents(direction_id);
create index idx_agents_service on agents(service_id);
create index idx_agents_grade on agents(grade_id);
create index idx_agents_categorie on agents(categorie_id);
create index idx_agents_statut on agents(statut_id);
create index idx_agents_actif on agents(actif);

alter table directions add constraint fk_dir_responsable foreign key (responsable_agent_id) references agents(id) on delete set null;
alter table services add constraint fk_svc_chef foreign key (chef_agent_id) references agents(id) on delete set null;

create table agent_historique (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  champ text not null,
  ancienne_valeur text,
  nouvelle_valeur text,
  motif text,
  date_effet date not null default current_date,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index idx_agent_historique_agent on agent_historique(agent_id);

-- ============================================================================
-- 5. MOUVEMENTS DU PERSONNEL
-- ============================================================================

create table mouvements (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  type_mouvement_id uuid not null references types_mouvement(id),
  date_effet date not null,
  direction_origine_id uuid references directions(id),
  service_origine_id uuid references services(id),
  grade_origine_id uuid references grades(id),
  direction_destination_id uuid references directions(id),
  service_destination_id uuid references services(id),
  grade_destination_id uuid references grades(id),
  motif text,
  reference_decision text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index idx_mouvements_agent on mouvements(agent_id);
create index idx_mouvements_date on mouvements(date_effet);
create index idx_mouvements_type on mouvements(type_mouvement_id);

-- ============================================================================
-- 6. CARRIERE
-- ============================================================================

create table carriere_evenements (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  type_evenement carriere_type_evenement not null,
  date_evenement date not null,
  description text,
  grade_id uuid references grades(id),
  fonction_id uuid references fonctions(id),
  service_id uuid references services(id),
  direction_id uuid references directions(id),
  created_by uuid,
  created_at timestamptz not null default now()
);

create index idx_carriere_agent on carriere_evenements(agent_id);

create table carriere_echeances (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  type_echeance text not null,
  date_echeance date not null,
  statut text not null default 'a_venir',
  description text,
  created_at timestamptz not null default now()
);

create index idx_echeances_date on carriere_echeances(date_echeance);

-- ============================================================================
-- 7. ABSENCES ET CONGES
-- ============================================================================

create table absences (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  type_absence_id uuid not null references types_absence(id),
  date_debut date not null,
  date_fin date not null,
  nb_jours numeric(6,1) not null,
  justificatif_url text,
  statut absence_statut not null default 'demandee',
  motif text,
  validee_par uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_dates check (date_fin >= date_debut)
);

create index idx_absences_agent on absences(agent_id);
create index idx_absences_dates on absences(date_debut, date_fin);
create index idx_absences_type on absences(type_absence_id);

-- ============================================================================
-- 8. FORMATIONS ET COMPETENCES
-- ============================================================================

create table formations (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text,
  organisme_id uuid references organismes_formation(id),
  competence_id uuid references competences(id),
  cout numeric(12,2) default 0,
  duree_heures numeric(6,1),
  date_debut date,
  date_fin date,
  lieu text,
  capacite int,
  statut text not null default 'planifiee',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table formation_participants (
  id uuid primary key default gen_random_uuid(),
  formation_id uuid not null references formations(id) on delete cascade,
  agent_id uuid not null references agents(id) on delete cascade,
  statut text not null default 'inscrit',
  resultat text,
  note numeric(4,1),
  created_at timestamptz not null default now(),
  unique (formation_id, agent_id)
);

create index idx_form_part_agent on formation_participants(agent_id);
create index idx_form_part_formation on formation_participants(formation_id);

create table agent_competences (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  competence_id uuid not null references competences(id) on delete cascade,
  niveau int not null check (niveau between 1 and 5),
  date_acquisition date default current_date,
  source text default 'formation',
  formation_id uuid references formations(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (agent_id, competence_id)
);

create index idx_agent_comp_agent on agent_competences(agent_id);

-- ============================================================================
-- 9. PERFORMANCE
-- ============================================================================

create table campagnes_evaluation (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  periode_debut date not null,
  periode_fin date not null,
  statut evaluation_statut not null default 'planifiee',
  created_at timestamptz not null default now()
);

create table objectifs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  campagne_id uuid references campagnes_evaluation(id) on delete cascade,
  libelle text not null,
  description text,
  poids numeric(5,2) default 100,
  cible numeric,
  unite text,
  created_at timestamptz not null default now()
);

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  campagne_id uuid references campagnes_evaluation(id) on delete cascade,
  evaluateur_id uuid,
  date_evaluation date not null default current_date,
  note_globale numeric(4,1),
  taux_atteinte numeric(5,2),
  synthese text,
  statut evaluation_statut not null default 'planifiee',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_evaluations_agent on evaluations(agent_id);

create table evaluation_objectifs (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references evaluations(id) on delete cascade,
  objectif_id uuid not null references objectifs(id) on delete cascade,
  resultat numeric,
  taux_atteinte numeric(5,2),
  commentaire text
);

-- ============================================================================
-- 10. REMUNERATIONS (masse salariale)
-- ============================================================================

create table remunerations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  periode date not null,
  salaire_base numeric(12,2) not null default 0,
  primes numeric(12,2) not null default 0,
  indemnites numeric(12,2) not null default 0,
  total numeric(12,2) generated always as (salaire_base + primes + indemnites) stored,
  created_at timestamptz not null default now(),
  unique (agent_id, periode)
);

create index idx_remun_periode on remunerations(periode);
create index idx_remun_agent on remunerations(agent_id);

-- ============================================================================
-- 11. QUALITE DES DONNEES
-- ============================================================================

create table quality_scans (
  id uuid primary key default gen_random_uuid(),
  lance_par uuid,
  date_scan timestamptz not null default now(),
  score_global numeric(5,1),
  completude numeric(5,1),
  coherence numeric(5,1),
  unicite numeric(5,1),
  actualisation numeric(5,1),
  nb_anomalies int not null default 0,
  created_at timestamptz not null default now()
);

create table quality_anomalies (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references quality_scans(id) on delete cascade,
  type_anomalie text not null,
  gravite text not null default 'moyenne',
  table_concernee text not null,
  record_id uuid,
  agent_id uuid references agents(id) on delete cascade,
  description text not null,
  statut text not null default 'ouverte',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index idx_anomalies_agent on quality_anomalies(agent_id);
create index idx_anomalies_statut on quality_anomalies(statut);

-- ============================================================================
-- 12. IMPORTS
-- ============================================================================

create table import_jobs (
  id uuid primary key default gen_random_uuid(),
  nom_fichier text not null,
  type_import import_type not null,
  format text not null,
  statut import_statut not null default 'en_cours',
  nb_lignes int not null default 0,
  nb_succes int not null default 0,
  nb_erreurs int not null default 0,
  erreurs jsonb not null default '[]',
  importe_par uuid,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ============================================================================
-- 13. ALERTES
-- ============================================================================

create table alert_rules (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  niveau alerte_niveau not null,
  description text,
  seuil numeric,
  actif boolean not null default true,
  parametres jsonb not null default '{}'
);

create table alertes (
  id uuid primary key default gen_random_uuid(),
  rule_code text references alert_rules(code) on delete set null,
  niveau alerte_niveau not null,
  titre text not null,
  description text,
  agent_id uuid references agents(id) on delete cascade,
  direction_id uuid references directions(id) on delete cascade,
  service_id uuid references services(id) on delete cascade,
  statut alerte_statut not null default 'nouvelle',
  donnees jsonb not null default '{}',
  created_at timestamptz not null default now(),
  vue_par uuid,
  vue_at timestamptz,
  traitee_par uuid,
  traitee_at timestamptz
);

create index idx_alertes_statut on alertes(statut);
create index idx_alertes_agent on alertes(agent_id);
create index idx_alertes_service on alertes(service_id);
create index idx_alertes_niveau on alertes(niveau);

-- ============================================================================
-- 14. RAPPORTS
-- ============================================================================

create table rapports (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  type text not null,
  description text,
  parametres jsonb not null default '{}',
  format text not null default 'html',
  genere_par uuid,
  contenu jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 15. DECISIONS ET AUDIT
-- ============================================================================

create table decisions (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text,
  type text not null default 'autre',
  agent_id uuid references agents(id) on delete set null,
  direction_id uuid references directions(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  decideur_id uuid,
  date_decision date not null default current_date,
  statut decision_statut not null default 'enregistree',
  suivi text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid,
  action text not null,
  ancien jsonb,
  nouveau jsonb,
  user_id uuid,
  created_at timestamptz not null default now()
);

create index idx_audit_table on audit_log(table_name, record_id);
create index idx_audit_created on audit_log(created_at);

create or replace function public.audit_trigger_fn()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into audit_log(table_name, record_id, action, ancien, nouveau, user_id)
  values (
    TG_TABLE_NAME,
    coalesce(new.id, old.id),
    lower(TG_OP),
    case when TG_OP in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when TG_OP in ('UPDATE','INSERT') then to_jsonb(new) else null end,
    auth.uid()
  );
  return coalesce(new, old);
end;
$$;

-- ============================================================================
-- 16. UTILISATEURS / ROLES / PERMISSIONS
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agent_id uuid references agents(id) on delete set null,
  nom text not null,
  prenom text not null,
  email text not null,
  role user_role not null default 'agent',
  direction_id uuid references directions(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table role_permissions (
  id uuid primary key default gen_random_uuid(),
  role user_role not null,
  module text not null,
  peut_voir boolean not null default true,
  peut_creer boolean not null default false,
  peut_modifier boolean not null default false,
  peut_supprimer boolean not null default false,
  perimetre text not null default 'tous',
  unique (role, module)
);

-- ============================================================================
-- 17. ASSISTANT IA
-- ============================================================================

create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  titre text not null default 'Nouvelle conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  contenu text not null,
  donnees_utilisees jsonb,
  created_at timestamptz not null default now()
);

create index idx_ai_messages_conv on ai_messages(conversation_id);

-- ============================================================================
-- 18. TRIGGERS updated_at
-- ============================================================================

do $$
declare t text;
begin
  for t in select unnest(array[
    'directions','services','agents','absences','formations',
    'evaluations','profiles','decisions','role_permissions'
  ]) loop
    execute format('create trigger trg_%I_updated_at before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- Audit triggers on key tables
do $$
declare t text;
begin
  for t in select unnest(array['agents','mouvements','carriere_evenements','absences','evaluations','decisions']) loop
    execute format('create trigger trg_%I_audit after insert or update or delete on %I for each row execute function audit_trigger_fn()', t, t);
  end loop;
end $$;

-- ============================================================================
-- 19. FONCTIONS D'ACCES (RBAC) — utilisees par les policies RLS
-- ============================================================================

create or replace function public.auth_profile()
returns profiles
language sql stable security definer set search_path = public as $$
  select * from profiles where id = auth.uid();
$$;

create or replace function public.auth_role()
returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.auth_direction_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select direction_id from profiles where id = auth.uid();
$$;

create or replace function public.auth_service_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select service_id from profiles where id = auth.uid();
$$;

create or replace function public.auth_agent_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select agent_id from profiles where id = auth.uid();
$$;

create or replace function public.is_admin_or_drh()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() in ('admin','drh'), false);
$$;

create or replace function public.can_manage_referentiels()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth_role() in ('admin','drh','responsable_rh'), false);
$$;

-- Perimetre d'acces a un agent donne, selon le role de l'utilisateur courant
create or replace function public.agent_in_scope(p_agent_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select case auth_role()
    when 'admin' then true
    when 'drh' then true
    when 'direction_generale' then true
    when 'responsable_rh' then (
      auth_direction_id() is null
      or exists (select 1 from agents a where a.id = p_agent_id and a.direction_id = auth_direction_id())
    )
    when 'chef_service' then exists (
      select 1 from agents a where a.id = p_agent_id and a.service_id = auth_service_id()
    )
    when 'agent' then p_agent_id = auth_agent_id()
    else false
  end;
$$;

-- Perimetre d'acces a un service/direction donne
create or replace function public.scope_in_perimeter(p_direction_id uuid, p_service_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select case auth_role()
    when 'admin' then true
    when 'drh' then true
    when 'direction_generale' then true
    when 'responsable_rh' then (auth_direction_id() is null or p_direction_id = auth_direction_id() or p_direction_id is null)
    when 'chef_service' then (p_service_id = auth_service_id() or p_service_id is null)
    when 'agent' then false
    else false
  end;
$$;

-- ============================================================================
-- 20. FONCTIONS KPI (SECURITY INVOKER -> respectent le RLS de l'appelant)
-- ============================================================================

create or replace function public.kpi_effectif(p_date date default current_date)
returns int language sql stable as $$
  select count(*)::int from agents
  where date_recrutement <= p_date
    and (date_sortie is null or date_sortie > p_date);
$$;

create or replace function public.kpi_turnover(p_date_debut date, p_date_fin date)
returns numeric language sql stable as $$
  with departs as (
    select count(*)::numeric as n from mouvements m
    join types_mouvement tm on tm.id = m.type_mouvement_id
    where tm.sens = 'sortie' and m.date_effet between p_date_debut and p_date_fin
  ),
  eff_debut as (select kpi_effectif(p_date_debut) as n),
  eff_fin as (select kpi_effectif(p_date_fin) as n)
  select case when (eff_debut.n + eff_fin.n) = 0 then 0
    else round(departs.n / ((eff_debut.n + eff_fin.n) / 2.0) * 100, 2)
  end
  from departs, eff_debut, eff_fin;
$$;

create or replace function public.kpi_absenteisme(p_date_debut date, p_date_fin date, p_service_id uuid default null)
returns numeric language sql stable as $$
  with jours_absence as (
    select coalesce(sum(a.nb_jours), 0) as n
    from absences a
    join agents ag on ag.id = a.agent_id
    where a.statut = 'validee'
      and a.date_debut <= p_date_fin and a.date_fin >= p_date_debut
      and (p_service_id is null or ag.service_id = p_service_id)
  ),
  jours_ouvres as (
    select greatest((p_date_fin - p_date_debut + 1), 1) * greatest(
      (select count(*) from agents ag where ag.actif = true and (p_service_id is null or ag.service_id = p_service_id)), 1
    ) as n
  )
  select round(jours_absence.n / jours_ouvres.n * 100, 2)
  from jours_absence, jours_ouvres;
$$;

create or replace function public.kpi_masse_salariale(p_periode_debut date, p_periode_fin date)
returns numeric language sql stable as $$
  select coalesce(sum(r.total), 0) from remunerations r
  where r.periode between p_periode_debut and p_periode_fin;
$$;

create or replace function public.kpi_taux_couverture_formation(p_date_debut date, p_date_fin date)
returns numeric language sql stable as $$
  with formes as (
    select count(distinct fp.agent_id)::numeric as n
    from formation_participants fp
    join formations f on f.id = fp.formation_id
    where f.date_debut between p_date_debut and p_date_fin
  ),
  effectif as (select kpi_effectif(p_date_fin)::numeric as n)
  select case when effectif.n = 0 then 0 else round(formes.n / effectif.n * 100, 2) end
  from formes, effectif;
$$;

-- ============================================================================
-- 21. ROW LEVEL SECURITY
-- ============================================================================

alter table directions enable row level security;
alter table services enable row level security;
alter table fonctions enable row level security;
alter table categories enable row level security;
alter table grades enable row level security;
alter table statuts enable row level security;
alter table types_absence enable row level security;
alter table types_mouvement enable row level security;
alter table organismes_formation enable row level security;
alter table competences enable row level security;
alter table agents enable row level security;
alter table agent_historique enable row level security;
alter table mouvements enable row level security;
alter table carriere_evenements enable row level security;
alter table carriere_echeances enable row level security;
alter table absences enable row level security;
alter table formations enable row level security;
alter table formation_participants enable row level security;
alter table agent_competences enable row level security;
alter table campagnes_evaluation enable row level security;
alter table objectifs enable row level security;
alter table evaluations enable row level security;
alter table evaluation_objectifs enable row level security;
alter table remunerations enable row level security;
alter table quality_scans enable row level security;
alter table quality_anomalies enable row level security;
alter table import_jobs enable row level security;
alter table alert_rules enable row level security;
alter table alertes enable row level security;
alter table rapports enable row level security;
alter table decisions enable row level security;
alter table audit_log enable row level security;
alter table profiles enable row level security;
alter table role_permissions enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;

-- Referentiels : lecture pour tout utilisateur connecte, ecriture reservee
create policy ref_select on directions for select to authenticated using (true);
create policy ref_write on directions for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy ref_select on services for select to authenticated using (true);
create policy ref_write on services for all to authenticated using (can_manage_referentiels()) with check (can_manage_referentiels());

create policy ref_select on fonctions for select to authenticated using (true);
create policy ref_write on fonctions for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy ref_select on categories for select to authenticated using (true);
create policy ref_write on categories for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy ref_select on grades for select to authenticated using (true);
create policy ref_write on grades for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy ref_select on statuts for select to authenticated using (true);
create policy ref_write on statuts for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy ref_select on types_absence for select to authenticated using (true);
create policy ref_write on types_absence for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy ref_select on types_mouvement for select to authenticated using (true);
create policy ref_write on types_mouvement for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy ref_select on organismes_formation for select to authenticated using (true);
create policy ref_write on organismes_formation for all to authenticated using (can_manage_referentiels()) with check (can_manage_referentiels());

create policy ref_select on competences for select to authenticated using (true);
create policy ref_write on competences for all to authenticated using (can_manage_referentiels()) with check (can_manage_referentiels());

-- Agents : perimetre strict
create policy agents_select on agents for select to authenticated using (agent_in_scope(id));
create policy agents_write on agents for insert to authenticated with check (can_manage_referentiels());
create policy agents_update on agents for update to authenticated using (can_manage_referentiels() and agent_in_scope(id)) with check (can_manage_referentiels());
create policy agents_delete on agents for delete to authenticated using (is_admin_or_drh());

create policy agent_hist_select on agent_historique for select to authenticated using (agent_in_scope(agent_id));
create policy agent_hist_write on agent_historique for insert to authenticated with check (can_manage_referentiels());

-- Mouvements
create policy mouvements_select on mouvements for select to authenticated using (agent_in_scope(agent_id));
create policy mouvements_write on mouvements for all to authenticated using (can_manage_referentiels() and agent_in_scope(agent_id)) with check (can_manage_referentiels());

-- Carriere
create policy carriere_select on carriere_evenements for select to authenticated using (agent_in_scope(agent_id));
create policy carriere_write on carriere_evenements for all to authenticated using (can_manage_referentiels() and agent_in_scope(agent_id)) with check (can_manage_referentiels());

create policy echeances_select on carriere_echeances for select to authenticated using (agent_in_scope(agent_id));
create policy echeances_write on carriere_echeances for all to authenticated using (can_manage_referentiels() and agent_in_scope(agent_id)) with check (can_manage_referentiels());

-- Absences
create policy absences_select on absences for select to authenticated using (agent_in_scope(agent_id));
create policy absences_write on absences for all to authenticated using (can_manage_referentiels() and agent_in_scope(agent_id)) with check (can_manage_referentiels() and agent_in_scope(agent_id));
create policy absences_self_insert on absences for insert to authenticated with check (auth_role() = 'agent' and agent_id = auth_agent_id());

-- Formations : visibles par tous les authentifies (catalogue global)
create policy formations_select on formations for select to authenticated using (true);
create policy formations_write on formations for all to authenticated using (can_manage_referentiels()) with check (can_manage_referentiels());

create policy form_part_select on formation_participants for select to authenticated using (agent_in_scope(agent_id));
create policy form_part_write on formation_participants for all to authenticated using (can_manage_referentiels()) with check (can_manage_referentiels());

create policy agent_comp_select on agent_competences for select to authenticated using (agent_in_scope(agent_id));
create policy agent_comp_write on agent_competences for all to authenticated using (can_manage_referentiels()) with check (can_manage_referentiels());

-- Performance
create policy campagnes_select on campagnes_evaluation for select to authenticated using (true);
create policy campagnes_write on campagnes_evaluation for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy objectifs_select on objectifs for select to authenticated using (agent_in_scope(agent_id));
create policy objectifs_write on objectifs for all to authenticated using (can_manage_referentiels() and agent_in_scope(agent_id)) with check (can_manage_referentiels());

create policy evaluations_select on evaluations for select to authenticated using (agent_in_scope(agent_id));
create policy evaluations_write on evaluations for all to authenticated using (can_manage_referentiels() and agent_in_scope(agent_id)) with check (can_manage_referentiels());

create policy eval_obj_select on evaluation_objectifs for select to authenticated using (
  exists (select 1 from evaluations e where e.id = evaluation_id and agent_in_scope(e.agent_id))
);
create policy eval_obj_write on evaluation_objectifs for all to authenticated using (can_manage_referentiels()) with check (can_manage_referentiels());

-- Remunerations : reservees a l'encadrement RH (donnees sensibles)
create policy remun_select on remunerations for select to authenticated using (
  auth_role() in ('admin','drh') or (auth_role() = 'agent' and agent_id = auth_agent_id())
);
create policy remun_write on remunerations for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

-- Qualite des donnees
create policy quality_scans_select on quality_scans for select to authenticated using (is_admin_or_drh());
create policy quality_scans_write on quality_scans for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());
create policy quality_anom_select on quality_anomalies for select to authenticated using (is_admin_or_drh());
create policy quality_anom_write on quality_anomalies for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

-- Imports
create policy imports_select on import_jobs for select to authenticated using (is_admin_or_drh());
create policy imports_write on import_jobs for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

-- Alertes : visibles selon perimetre (agent/direction/service) ou globales si aucun rattachement
create policy alert_rules_select on alert_rules for select to authenticated using (is_admin_or_drh());
create policy alert_rules_write on alert_rules for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy alertes_select on alertes for select to authenticated using (
  auth_role() in ('admin','drh','direction_generale')
  or (agent_id is not null and agent_in_scope(agent_id))
  or (service_id is not null and scope_in_perimeter(direction_id, service_id))
  or (direction_id is not null and service_id is null and agent_id is null and scope_in_perimeter(direction_id, null))
);
create policy alertes_write on alertes for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());
create policy alertes_update_scope on alertes for update to authenticated using (
  auth_role() in ('responsable_rh','chef_service') and scope_in_perimeter(direction_id, service_id)
) with check (true);

-- Rapports
create policy rapports_select on rapports for select to authenticated using (
  auth_role() in ('admin','drh','direction_generale','responsable_rh','chef_service')
);
create policy rapports_write on rapports for all to authenticated using (
  auth_role() in ('admin','drh','responsable_rh','chef_service')
) with check (auth_role() in ('admin','drh','responsable_rh','chef_service'));

-- Decisions
create policy decisions_select on decisions for select to authenticated using (
  is_admin_or_drh()
  or (agent_id is not null and agent_in_scope(agent_id))
  or (agent_id is null and scope_in_perimeter(direction_id, service_id))
);
create policy decisions_write on decisions for all to authenticated using (can_manage_referentiels()) with check (can_manage_referentiels());

-- Audit log : lecture admin/drh uniquement, ecriture via trigger (security definer)
create policy audit_select on audit_log for select to authenticated using (is_admin_or_drh());

-- Profiles
create policy profiles_select_self on profiles for select to authenticated using (id = auth.uid() or auth_role() in ('admin','drh'));

-- Role permissions
create policy role_perm_select on role_permissions for select to authenticated using (true);
create policy role_perm_write on role_permissions for all to authenticated using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- Assistant IA : chacun voit ses propres conversations
create policy ai_conv_select on ai_conversations for select to authenticated using (user_id = auth.uid());
create policy ai_conv_write on ai_conversations for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy ai_msg_select on ai_messages for select to authenticated using (
  exists (select 1 from ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())
);
create policy ai_msg_write on ai_messages for all to authenticated using (
  exists (select 1 from ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())
);

-- ============================================================================
-- Fin de la migration initiale
-- ============================================================================
