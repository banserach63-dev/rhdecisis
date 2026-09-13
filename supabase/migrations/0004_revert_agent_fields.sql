-- ============================================================================
-- 0004. Annulation de 0003_agent_fields.sql
-- ============================================================================
-- Aucune donnée n'avait été saisie dans les nouveaux champs/référentiels au
-- moment de l'annulation (vérifié avant application).

alter table agents drop column if exists emploi_id;
alter table agents drop column if exists region_id;
alter table agents drop column if exists province_id;
alter table agents drop column if exists position_administrative_id;

alter table directions drop column if exists nature_structure_id;

drop table if exists provinces;
drop table if exists regions;
drop table if exists positions_administratives;
drop table if exists natures_structure;
drop table if exists emplois;
