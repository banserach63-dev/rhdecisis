-- ============================================================================
-- SARH-AD — Configuration du fournisseur IA (Assistant Analytique RH)
-- Permet à l'administrateur de choisir/paramétrer le fournisseur (Anthropic
-- Claude, OpenAI ou DeepSeek) depuis l'application, sans redéploiement.
-- ============================================================================

create table ai_settings (
  id int primary key default 1,
  provider text not null default 'anthropic' check (provider in ('anthropic', 'openai', 'deepseek')),
  model text,
  api_key text,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  constraint ai_settings_singleton check (id = 1)
);

insert into ai_settings (id, provider) values (1, 'anthropic')
on conflict (id) do nothing;

create trigger trg_ai_settings_updated_at
  before update on ai_settings
  for each row execute function set_updated_at();

alter table ai_settings enable row level security;

-- Reserve la configuration (et notamment la cle API) a l'administrateur.
create policy ai_settings_select on ai_settings for select to authenticated using (auth_role() = 'admin');
create policy ai_settings_write on ai_settings for all to authenticated using (auth_role() = 'admin') with check (auth_role() = 'admin');
