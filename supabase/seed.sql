-- ============================================================================
-- SARH-AD — Donnees de reference et jeu de demonstration
-- A executer apres la migration 0001_init.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Referentiels
-- ---------------------------------------------------------------------------

insert into categories (code, nom, ordre) values
  ('A', 'Categorie A - Cadres superieurs', 1),
  ('B', 'Categorie B - Cadres', 2),
  ('C', 'Categorie C - Agents de maitrise', 3),
  ('D', 'Categorie D - Agents d''execution', 4);

insert into grades (code, nom, categorie_id, echelon)
select v.code, v.nom, c.id, v.echelon from (values
  ('DIR', 'Directeur', 'A', '3'),
  ('SDIR', 'Sous-Directeur', 'A', '2'),
  ('ING-P', 'Ingenieur Principal', 'B', '2'),
  ('ING', 'Ingenieur', 'B', '1'),
  ('ATTC-P', 'Attache Principal', 'B', '2'),
  ('ATTC', 'Attache', 'B', '1'),
  ('TECH-S', 'Technicien Superieur', 'C', '2'),
  ('TECH', 'Technicien', 'C', '1'),
  ('AGT-Q', 'Agent Qualifie', 'D', '2'),
  ('AGT', 'Agent d''execution', 'D', '1')
) as v(code, nom, cat_code, echelon)
join categories c on c.code = v.cat_code;

insert into statuts (code, nom) values
  ('TITULAIRE', 'Titulaire'),
  ('STAGIAIRE', 'Stagiaire'),
  ('CONTRACTUEL', 'Contractuel'),
  ('DETACHE', 'Detache'),
  ('DISPONIBILITE', 'En disponibilite');

insert into types_absence (code, nom, remunere, justificatif_requis) values
  ('CA', 'Conge annuel', true, false),
  ('MAL', 'Maladie', true, true),
  ('MAT', 'Maternite', true, true),
  ('PAT', 'Paternite', true, false),
  ('SS', 'Sans solde', false, true),
  ('FORM', 'Formation', true, false),
  ('EXCEP', 'Autorisation exceptionnelle', true, false);

insert into types_mouvement (code, nom, sens) values
  ('RECRUT', 'Recrutement', 'entree'),
  ('DEPART_DEM', 'Demission', 'sortie'),
  ('DEPART_RET', 'Depart a la retraite', 'sortie'),
  ('DEPART_FIN', 'Fin de contrat', 'sortie'),
  ('MUTATION', 'Mutation', 'interne'),
  ('AFFECTATION', 'Affectation', 'interne'),
  ('DETACHEMENT', 'Detachement', 'interne'),
  ('DISPONIBILITE', 'Mise en disponibilite', 'interne'),
  ('PROMOTION', 'Promotion', 'interne'),
  ('CHANGT_GRADE', 'Changement de grade', 'interne');

insert into organismes_formation (nom, contact) values
  ('Institut National d''Administration', 'contact@ina.example'),
  ('Centre de Formation Professionnelle', 'contact@cfp.example'),
  ('Ecole Superieure de Management', 'contact@esm.example');

insert into competences (code, nom, categorie) values
  ('MGT', 'Management d''equipe', 'Management'),
  ('COMM', 'Communication', 'Transversal'),
  ('BUDG', 'Gestion budgetaire', 'Finance'),
  ('IT', 'Bureautique et systemes d''information', 'Technique'),
  ('DROIT', 'Droit administratif', 'Juridique'),
  ('PROJ', 'Gestion de projet', 'Management'),
  ('RH', 'Gestion des ressources humaines', 'RH'),
  ('LANG', 'Langues etrangeres', 'Transversal');

insert into directions (code, nom, description) values
  ('DG', 'Direction Generale', 'Pilotage strategique de l''organisation'),
  ('DRH', 'Direction des Ressources Humaines', 'Gestion du personnel'),
  ('DAF', 'Direction Administrative et Financiere', 'Finances et administration'),
  ('DSI', 'Direction des Systemes d''Information', 'Informatique et digital'),
  ('DTECH', 'Direction Technique', 'Operations techniques'),
  ('DCOM', 'Direction de la Communication', 'Communication institutionnelle');

insert into services (direction_id, code, nom)
select d.id, v.code, v.nom from (values
  ('DRH', 'SVC-REC', 'Service Recrutement'),
  ('DRH', 'SVC-CARR', 'Service Carrieres et Formation'),
  ('DRH', 'SVC-PAIE', 'Service Paie'),
  ('DAF', 'SVC-COMPTA', 'Service Comptabilite'),
  ('DAF', 'SVC-BUDGET', 'Service Budget'),
  ('DAF', 'SVC-LOG', 'Service Logistique'),
  ('DSI', 'SVC-DEV', 'Service Developpement'),
  ('DSI', 'SVC-INFRA', 'Service Infrastructure'),
  ('DSI', 'SVC-SUPPORT', 'Service Support Utilisateurs'),
  ('DTECH', 'SVC-EXPL', 'Service Exploitation'),
  ('DTECH', 'SVC-MAINT', 'Service Maintenance'),
  ('DCOM', 'SVC-EDITO', 'Service Editorial'),
  ('DCOM', 'SVC-EVENT', 'Service Evenementiel'),
  ('DG', 'SVC-AUDIT', 'Service Audit Interne')
) as v(dir_code, code, nom)
join directions d on d.code = v.dir_code;

insert into fonctions (code, nom) values
  ('DIRECTEUR', 'Directeur'),
  ('CHEF_SERVICE', 'Chef de service'),
  ('CHARGE_ETUDE', 'Charge d''etudes'),
  ('GESTIONNAIRE', 'Gestionnaire'),
  ('DEVELOPPEUR', 'Developpeur'),
  ('TECHNICIEN', 'Technicien'),
  ('ASSISTANT', 'Assistant administratif'),
  ('ANALYSTE', 'Analyste');

-- ---------------------------------------------------------------------------
-- Agents de demonstration (generes)
-- ---------------------------------------------------------------------------

do $$
declare
  prenoms_h text[] := array['Mohamed','Youssef','Karim','Omar','Ahmed','Hassan','Rachid','Said','Nabil','Amine','Tariq','Adil','Hamza','Yassine','Khalid'];
  prenoms_f text[] := array['Fatima','Amina','Nadia','Khadija','Salma','Leila','Samira','Hanane','Zineb','Sara','Imane','Meryem','Latifa','Souad','Karima'];
  noms text[] := array['El Amrani','Benali','Cherkaoui','Tazi','Idrissi','Bennani','Fassi','Alaoui','Chraibi','Berrada','Lahlou','Sqalli','Mansouri','Ouazzani','Belhaj','Ziani','Kettani','Bouzid','Naciri','Slaoui'];
  v_dir_ids uuid[];
  v_svc record;
  v_grade record;
  v_statut_titulaire uuid;
  v_statut_contractuel uuid;
  v_fonctions uuid[];
  i int;
  v_sexe sexe_enum;
  v_prenom text;
  v_nom text;
  v_matricule text;
  v_naissance date;
  v_recrutement date;
  v_agent_id uuid;
  v_statut_id uuid;
  n_agents int := 140;
begin
  select array_agg(id) into v_fonctions from fonctions;
  select id into v_statut_titulaire from statuts where code = 'TITULAIRE';
  select id into v_statut_contractuel from statuts where code = 'CONTRACTUEL';

  for i in 1..n_agents loop
    v_sexe := case when random() < 0.45 then 'F' else 'M' end;
    v_prenom := case when v_sexe = 'F' then prenoms_f[1 + floor(random()*array_length(prenoms_f,1))::int]
                      else prenoms_h[1 + floor(random()*array_length(prenoms_h,1))::int] end;
    v_nom := noms[1 + floor(random()*array_length(noms,1))::int];
    v_matricule := 'MAT' || lpad(i::text, 5, '0');
    v_naissance := (current_date - ((22 + floor(random()*38))::int || ' years')::interval - (floor(random()*365)::int || ' days')::interval)::date;
    v_recrutement := (current_date - (floor(random()*20*365)::int || ' days')::interval)::date;
    v_statut_id := case when random() < 0.8 then v_statut_titulaire else v_statut_contractuel end;

    select s.id, s.direction_id into v_svc from services s order by random() limit 1;
    select g.id, g.categorie_id into v_grade from grades g order by random() limit 1;

    insert into agents (
      matricule, nom, prenom, sexe, date_naissance, date_recrutement, date_prise_fonction,
      statut_id, categorie_id, grade_id, fonction_id, direction_id, service_id,
      lieu_affectation, situation_administrative, email, telephone, actif
    ) values (
      v_matricule, v_nom, v_prenom, v_sexe, v_naissance, v_recrutement, v_recrutement + 15,
      v_statut_id, v_grade.categorie_id, v_grade.id, v_fonctions[1 + floor(random()*array_length(v_fonctions,1))::int],
      v_svc.direction_id, v_svc.id,
      'Siege', 'Normale', lower(v_prenom || '.' || replace(v_nom,' ','') || i::text || '@sarh-ad.example'),
      '06' || lpad(floor(random()*100000000)::text, 8, '0'), true
    ) returning id into v_agent_id;

    insert into mouvements (agent_id, type_mouvement_id, date_effet, direction_destination_id, service_destination_id, grade_destination_id, motif)
    select v_agent_id, tm.id, v_recrutement, v_svc.direction_id, v_svc.id, v_grade.id, 'Recrutement initial'
    from types_mouvement tm where tm.code = 'RECRUT';

    insert into carriere_evenements (agent_id, type_evenement, date_evenement, description, grade_id, service_id, direction_id)
    values (v_agent_id, 'recrutement', v_recrutement, 'Recrutement de ' || v_prenom || ' ' || v_nom, v_grade.id, v_svc.id, v_svc.direction_id);

    -- Quelques agents partis (turnover) parmi les plus anciens
    if random() < 0.08 then
      update agents set actif = false, date_sortie = current_date - (floor(random()*180)::int || ' days')::interval, motif_sortie = 'Depart volontaire'
      where id = v_agent_id;
      insert into mouvements (agent_id, type_mouvement_id, date_effet, direction_origine_id, service_origine_id, motif)
      select v_agent_id, tm.id, current_date - (floor(random()*180)::int || ' days')::interval, v_svc.direction_id, v_svc.id, 'Demission'
      from types_mouvement tm where tm.code = 'DEPART_DEM';
    end if;

    -- Absences aleatoires sur les 12 derniers mois
    if random() < 0.6 then
      insert into absences (agent_id, type_absence_id, date_debut, date_fin, nb_jours, statut)
      select v_agent_id, ta.id, d, d + (1 + floor(random()*9))::int,
             (1 + floor(random()*9))::numeric, 'validee'
      from types_absence ta,
           lateral (select (current_date - (floor(random()*330)::int || ' days')::interval)::date as d) x
      where ta.code in ('CA','MAL')
      order by random() limit 1;
    end if;

    -- Remuneration du mois courant
    insert into remunerations (agent_id, periode, salaire_base, primes, indemnites)
    values (v_agent_id, date_trunc('month', current_date)::date,
      6000 + floor(random()*14000), floor(random()*2000), floor(random()*1000));

    -- Competences
    insert into agent_competences (agent_id, competence_id, niveau)
    select v_agent_id, c.id, 1 + floor(random()*5)::int
    from competences c order by random() limit (1 + floor(random()*3)::int)
    on conflict do nothing;
  end loop;
end $$;

-- Affecter des responsables de direction / chefs de service parmi les agents generes
update directions d set responsable_agent_id = (
  select a.id from agents a where a.direction_id = d.id order by random() limit 1
);
update services s set chef_agent_id = (
  select a.id from agents a where a.service_id = s.id order by random() limit 1
);

-- ---------------------------------------------------------------------------
-- Formations
-- ---------------------------------------------------------------------------

insert into formations (titre, description, organisme_id, competence_id, cout, duree_heures, date_debut, date_fin, lieu, capacite, statut)
select v.titre, v.description, o.id, c.id, v.cout, v.duree, v.debut, v.fin, 'Siege', v.capacite, v.statut
from (values
  ('Management d''equipe avance', 'Techniques de leadership et gestion d''equipe', 'MGT', 12000, 24, current_date - interval '60 days', current_date - interval '58 days', 20, 'terminee'),
  ('Excel avance pour la gestion RH', 'Tableaux croises dynamiques et automatisation', 'IT', 6000, 16, current_date - interval '30 days', current_date - interval '29 days', 25, 'terminee'),
  ('Gestion budgetaire publique', 'Elaboration et suivi budgetaire', 'BUDG', 15000, 32, current_date + interval '15 days', current_date + interval '18 days', 15, 'planifiee'),
  ('Communication interpersonnelle', 'Ameliorer la communication en equipe', 'COMM', 8000, 12, current_date + interval '30 days', current_date + interval '31 days', 30, 'planifiee')
) as v(titre, description, comp_code, cout, duree, debut, fin, capacite, statut)
join competences c on c.code = v.comp_code
cross join lateral (select id from organismes_formation order by random() limit 1) o;

insert into formation_participants (formation_id, agent_id, statut)
select f.id, a.id, case when f.statut = 'terminee' then 'complete' else 'inscrit' end
from formations f
cross join lateral (select id from agents where actif = true order by random() limit 8) a
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Campagne d'evaluation et evaluations
-- ---------------------------------------------------------------------------

insert into campagnes_evaluation (nom, periode_debut, periode_fin, statut)
values ('Evaluation annuelle ' || extract(year from current_date), date_trunc('year', current_date)::date, (date_trunc('year', current_date) + interval '1 year' - interval '1 day')::date, 'en_cours');

insert into evaluations (agent_id, campagne_id, date_evaluation, note_globale, taux_atteinte, synthese, statut)
select a.id, c.id, current_date - (floor(random()*60)::int || ' days')::interval,
  round((10 + random()*10)::numeric, 1), round((60 + random()*40)::numeric, 1),
  'Evaluation generee automatiquement pour la demonstration.', 'validee'
from agents a
cross join lateral (select id from campagnes_evaluation order by created_at desc limit 1) c
where a.actif = true and random() < 0.5;

-- ---------------------------------------------------------------------------
-- Regles d'alerte
-- ---------------------------------------------------------------------------

insert into alert_rules (code, nom, niveau, description, seuil) values
  ('RETRAITE_PROCHE', 'Depart a la retraite imminent', 'critique', 'Agents atteignant l''age de la retraite (62 ans) dans les 12 prochains mois', 62),
  ('ABSENTEISME_SERVICE', 'Hausse de l''absenteisme par service', 'importante', 'Taux d''absenteisme d''un service depassant le seuil de reference', 8),
  ('DOSSIER_INCOMPLET', 'Dossier agent incomplet', 'qualite', 'Champs obligatoires manquants dans la fiche agent', null),
  ('FORMATION_ELIGIBLE', 'Agents eligibles a une formation', 'information', 'Agents repondant aux criteres d''une action de formation', null);

-- ---------------------------------------------------------------------------
-- Permissions par role (matrice indicative, modifiable en Administration)
-- ---------------------------------------------------------------------------

insert into role_permissions (role, module, peut_voir, peut_creer, peut_modifier, peut_supprimer, perimetre)
select r.role, m.module,
  true,
  r.role in ('admin','drh','responsable_rh') and m.module not in ('administration'),
  r.role in ('admin','drh','responsable_rh'),
  r.role in ('admin','drh'),
  case r.role
    when 'chef_service' then 'service'
    when 'responsable_rh' then 'direction'
    when 'agent' then 'personnel'
    else 'tous'
  end
from (values ('admin'::user_role), ('drh'::user_role), ('responsable_rh'::user_role), ('chef_service'::user_role), ('direction_generale'::user_role), ('agent'::user_role)) as r(role)
cross join (values ('agents'),('effectifs'),('mouvements'),('carrieres'),('absences'),('formations'),
  ('performances'),('qualite'),('import'),('kpi'),('alertes'),('rapports'),('administration')) as m(module)
on conflict do nothing;
