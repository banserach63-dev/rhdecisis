-- ============================================================================
-- 0003. Champs agent complémentaires : Emploi, Structure (Nature de structure),
-- Région, Province, Position administrative
-- ============================================================================

-- 1. Nouveaux référentiels ----------------------------------------------------

create table emplois (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  description text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table natures_structure (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  description text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table regions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table provinces (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  region_id uuid references regions(id) on delete restrict,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table positions_administratives (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom text not null,
  description text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_provinces_region on provinces(region_id);

-- 2. Nature de structure sur les directions (= "Structure") ------------------
-- La "Structure" de l'agent reste portée par directions/services (déjà utilisés
-- par la sécurité au niveau ligne) ; "Nature de structure" qualifie la
-- direction (ex. Direction centrale, Direction régionale, Service déconcentré).

alter table directions add column nature_structure_id uuid references natures_structure(id) on delete set null;
create index idx_directions_nature on directions(nature_structure_id);

-- 3. Champs complémentaires sur agents ---------------------------------------

alter table agents add column emploi_id uuid references emplois(id) on delete set null;
alter table agents add column region_id uuid references regions(id) on delete set null;
alter table agents add column province_id uuid references provinces(id) on delete set null;
alter table agents add column position_administrative_id uuid references positions_administratives(id) on delete set null;

create index idx_agents_emploi on agents(emploi_id);
create index idx_agents_region on agents(region_id);
create index idx_agents_province on agents(province_id);
create index idx_agents_position_administrative on agents(position_administrative_id);

-- 4. RLS des nouveaux référentiels (même politique que les référentiels existants) --

alter table emplois enable row level security;
alter table natures_structure enable row level security;
alter table regions enable row level security;
alter table provinces enable row level security;
alter table positions_administratives enable row level security;

create policy ref_select on emplois for select to authenticated using (true);
create policy ref_write on emplois for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy ref_select on natures_structure for select to authenticated using (true);
create policy ref_write on natures_structure for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy ref_select on regions for select to authenticated using (true);
create policy ref_write on regions for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy ref_select on provinces for select to authenticated using (true);
create policy ref_write on provinces for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());

create policy ref_select on positions_administratives for select to authenticated using (true);
create policy ref_write on positions_administratives for all to authenticated using (is_admin_or_drh()) with check (is_admin_or_drh());
