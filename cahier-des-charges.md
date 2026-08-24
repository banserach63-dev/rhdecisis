CAHIER DES CHARGES FONCTIONNEL
Système Analytique RH d’Aide à la Décision — SARH-AD
Version : 1.0
________________________________________
1. Présentation du projet
Le SARH-AD — Système Analytique RH d’Aide à la Décision est une application web destinée aux Directions des Ressources Humaines.
Son objectif est de permettre à une organisation de centraliser, fiabiliser, analyser et exploiter ses données RH afin de faciliter la prise de décision.
Le principe général du système est :
Données RH → Information → Analyse → Alerte → Décision → Suivi
L’application doit être évolutive. Une première version fonctionnelle sera développée, puis des fonctionnalités plus avancées telles que la prédiction, la simulation et l’intelligence artificielle pourront être intégrées progressivement.
________________________________________
2. Problème à résoudre
Les données liées aux ressources humaines peuvent être réparties dans différents fichiers, notamment Excel ou CSV, ce qui peut rendre leur exploitation difficile.
L’application doit permettre de disposer d’un système unique capable de :
•	centraliser les informations RH ;
•	améliorer la qualité des données ;
•	automatiser les calculs et indicateurs RH ;
•	faciliter l’analyse des effectifs ;
•	suivre les évolutions du personnel ;
•	détecter certaines anomalies ;
•	générer des alertes ;
•	produire des rapports ;
•	conserver l’historique des informations ;
•	aider la Direction des Ressources Humaines dans ses décisions.
________________________________________
3. Objectifs de l’application
3.1 Objectif principal
Mettre à disposition de la DRH une plateforme permettant de prendre des décisions basées sur des données RH fiables, actualisées et traçables.
3.2 Objectifs spécifiques
L’application devra permettre de :
•	centraliser les données RH ;
•	gérer les informations des agents ;
•	suivre les effectifs ;
•	analyser les mouvements du personnel ;
•	suivre les carrières ;
•	analyser les absences ;
•	suivre les formations ;
•	suivre les performances ;
•	mesurer différents indicateurs RH ;
•	contrôler automatiquement la qualité des données ;
•	identifier certaines anomalies ;
•	générer des alertes ;
•	produire des tableaux de bord ;
•	produire des rapports ;
•	conserver l’historique des données et des décisions ;
•	permettre progressivement l’utilisation de l’intelligence artificielle.
________________________________________
4. Utilisateurs et rôles
L’application comportera plusieurs catégories d’utilisateurs.
4.1 Administrateur
L’Administrateur dispose des droits d’administration de la plateforme.
Il pourra notamment accéder aux fonctions d’administration nécessaires au fonctionnement du système.
________________________________________
4.2 DRH
La Direction des Ressources Humaines dispose d’une vue globale sur les données et indicateurs RH.
Elle pourra consulter notamment :
•	les effectifs ;
•	les mouvements ;
•	les absences ;
•	les carrières ;
•	les formations ;
•	les performances ;
•	les KPI ;
•	les alertes ;
•	les rapports.
________________________________________
4.3 Responsable RH
Le Responsable RH pourra gérer et analyser les informations RH correspondant à son périmètre.
________________________________________
4.4 Chef de service
Le Chef de service pourra consulter les informations et indicateurs correspondant à son propre service.
Il ne devra pas pouvoir consulter les données individuelles appartenant à un autre service.
________________________________________
4.5 Direction générale
La Direction générale disposera principalement d’une vue de consultation des indicateurs stratégiques et tableaux de bord.
________________________________________
4.6 Agent
Un Agent pourra consulter les informations qui le concernent selon les droits qui lui sont accordés.
Le système devra donc appliquer un contrôle des accès basé sur les rôles et le périmètre de chaque utilisateur.
________________________________________
5. Fonctionnalités de l’application
5.1 Authentification
L’application devra disposer d’un système de connexion sécurisé.
Chaque utilisateur devra accéder à l’application avec son compte.
Après connexion, les fonctionnalités et informations accessibles devront dépendre :
•	de son rôle ;
•	de ses autorisations ;
•	de son périmètre d’accès.
________________________________________
5.2 Tableau de bord RH
L’application devra proposer un tableau de bord permettant d’obtenir rapidement une vue globale de la situation RH.
Il devra notamment afficher :
•	effectif total ;
•	répartition femmes/hommes ;
•	âge moyen ;
•	ancienneté moyenne ;
•	recrutements ;
•	départs ;
•	turnover ;
•	absentéisme ;
•	formations ;
•	masse salariale ;
•	nombre d’alertes.
Le tableau de bord pourra également comporter des graphiques présentant :
•	l’évolution des effectifs ;
•	la pyramide des âges ;
•	la répartition femmes/hommes ;
•	la répartition par direction ;
•	l’évolution des départs ;
•	l’absentéisme ;
•	les formations ;
•	les alertes.
________________________________________
5.3 Gestion des agents
L’application devra permettre de centraliser les informations relatives à chaque agent.
La fiche d’un agent devra pouvoir contenir notamment :
•	matricule ;
•	nom ;
•	prénom ;
•	sexe ;
•	date de naissance ;
•	date de recrutement ;
•	statut ;
•	catégorie ;
•	grade ;
•	fonction ;
•	direction ;
•	service ;
•	lieu d’affectation ;
•	date de prise de fonction ;
•	ancienneté ;
•	situation administrative.
L’application devra également conserver l’historique des changements concernant l’agent.
________________________________________
5.4 Gestion des directions
Le système devra permettre de gérer les différentes directions de l’organisation.
Les agents pourront être associés à leurs directions respectives.
Les directions serviront également de critères pour les analyses et tableaux de bord.
________________________________________
5.5 Gestion des services
Le système devra gérer les différents services.
Chaque service pourra être associé à une direction.
Les analyses devront pouvoir être réalisées par service.
________________________________________
5.6 Gestion des grades
L’application devra gérer les différents grades utilisés par l’organisation.
Chaque agent pourra être associé à un grade.
Les grades pourront être utilisés dans les analyses statistiques.
________________________________________
5.7 Gestion des catégories
L’application devra gérer les différentes catégories professionnelles utilisées par l’organisation.
________________________________________
5.8 Gestion des statuts
L’application devra permettre de gérer les différents statuts administratifs des agents.
________________________________________
5.9 Analyse des effectifs
L’application devra permettre d’analyser les effectifs selon plusieurs critères :
•	direction ;
•	service ;
•	sexe ;
•	âge ;
•	grade ;
•	catégorie ;
•	statut ;
•	localisation ;
•	année.
Les résultats devront pouvoir être présentés sous forme :
•	d’indicateurs ;
•	de statistiques ;
•	de tableaux ;
•	de graphiques.
________________________________________
5.10 Gestion des mouvements du personnel
Le système devra permettre de suivre les principaux mouvements concernant les agents :
•	recrutements ;
•	départs ;
•	mutations ;
•	affectations ;
•	détachements ;
•	disponibilités ;
•	promotions ;
•	changements de grade ;
•	départs à la retraite.
Le système devra également permettre le calcul d’indicateurs liés aux mouvements.
Exemple : taux de turnover
Turnover = (Nombre de départs / Effectif moyen) × 100
________________________________________
5.11 Gestion des carrières
L’application devra permettre de suivre le parcours professionnel d’un agent.
Le système devra notamment pouvoir retracer :
Recrutement → Affectation → Avancement → Promotion → Mutation → Nouvelle responsabilité → Retraite ou départ
L’historique professionnel de l’agent devra être conservé.
Le système pourra également signaler les prochaines échéances de carrière.
________________________________________
5.12 Gestion des absences et congés
L’application devra permettre de suivre et analyser les absences.
Elle devra notamment calculer ou présenter :
•	nombre d’absences ;
•	nombre de jours d’absence ;
•	taux d’absentéisme ;
•	durée moyenne des absences ;
•	évolution mensuelle ;
•	évolution annuelle ;
•	comparaison entre services.
Le système devra également pouvoir générer une alerte lorsqu’une situation particulière est détectée.
Exemple :
Hausse importante du taux d’absentéisme d’un service sur une période donnée.
________________________________________
5.13 Gestion des formations
L’application devra permettre de suivre :
•	les formations ;
•	les participants ;
•	les coûts ;
•	la durée ;
•	les organismes ;
•	les compétences concernées ;
•	le taux de participation ;
•	les résultats.
L’application devra pouvoir calculer des indicateurs de formation.
Exemple : taux de couverture de formation
TCF = (Nombre d’agents formés / Effectif total) × 100
Une évolution pourra également permettre de construire une matrice Compétences × Agents.
5.14 Gestion de la performance
L’application devra pouvoir enregistrer et analyser :
•	les objectifs ;
•	les indicateurs ;
•	les résultats ;
•	les taux d’atteinte ;
•	les évaluations ;
•	l’évolution des performances.
Les performances pourront être analysées par agent, service ou autre périmètre autorisé.
5.15 Contrôle de la qualité des données
La qualité des données constitue une fonctionnalité importante du système.
Avant d’utiliser certaines données pour produire des indicateurs, l’application devra pouvoir détecter notamment :
•	les doublons ;
•	les champs obligatoires non renseignés ;
•	les dates incohérentes ;
•	les agents sans service ;
•	les agents sans grade ;
•	les matricules invalides ;
•	les incohérences entre différentes données ;
•	les données obsolètes.
L’application pourra afficher un tableau de contrôle comprenant :
•	un score global de qualité ;
•	le niveau de complétude ;
•	le niveau de cohérence ;
•	le niveau d’unicité ;
•	le niveau d’actualisation ;
•	le nombre d’anomalies détectées.
5.16 Importation des données
L’application devra permettre d’importer des données RH provenant de fichiers externes.
Les formats prévus dans le document sont notamment :
•	Excel ;
•	CSV.
Les données importées devront ensuite pouvoir être intégrées au système et soumises aux contrôles de qualité.
5.17 KPI RH
L’application devra calculer automatiquement différents indicateurs RH à partir des données enregistrées.
Les KPI pourront notamment concerner :
•	les effectifs ;
•	le turnover ;
•	l’absentéisme ;
•	les recrutements ;
•	les départs ;
•	les formations ;
•	la performance ;
•	la masse salariale ;
•	la qualité des données.
5.18 Système d’alertes
L’application devra être capable de générer automatiquement différents niveaux d’alertes.
Alertes critiques
Exemple :
Des agents atteindront prochainement l’âge prévu pour leur départ à la retraite.
Alertes importantes
Exemple :
Le taux d’absentéisme d’un service dépasse un seuil de référence.
Alertes de qualité
Exemple :
Des dossiers d’agents contiennent des informations manquantes.
Informations
Exemple :
Des agents répondent aux critères configurés pour une action de formation.
5.19 Rapports
L’application devra permettre de produire des rapports à partir des données disponibles.
Les rapports devront permettre de restituer les informations RH sous une forme facilement exploitable par la DRH et la Direction générale.
Ils pourront intégrer :
•	indicateurs ;
•	statistiques ;
•	tableaux ;
•	graphiques ;
•	analyses.
5.20 Historisation et traçabilité
Le système devra conserver l’historique des informations importantes.
La traçabilité devra notamment concerner :
•	les changements concernant les agents ;
•	les mouvements ;
•	les carrières ;
•	les principales données RH ;
•	les actions nécessitant un suivi ;
•	les décisions enregistrées dans le système.
5.21 Administration
Une partie Administration devra permettre de gérer les éléments nécessaires au fonctionnement de l’application.
Elle concernera notamment :
•	les utilisateurs ;
•	les rôles ;
•	les permissions ;
•	les référentiels ;
•	les paramètres nécessaires à l’application.
6. Intelligence artificielle
L’application devra être conçue pour pouvoir intégrer des fonctionnalités d’intelligence artificielle.
6.1 Assistant Analytique RH
Un assistant IA pourra permettre à un utilisateur autorisé de poser des questions en langage naturel.
Exemple :
Quels services ont connu la plus forte augmentation de l’absentéisme cette année ?
L’application devra alors pouvoir :
1.	comprendre la demande ;
2.	utiliser les données RH disponibles ;
3.	effectuer les calculs nécessaires ;
4.	présenter les résultats ;
5.	générer, si nécessaire, un graphique ;
6.	expliquer le résultat ;
7.	indiquer les données utilisées.
L’IA devra travailler à partir des données RH disponibles et validées dans l’application et ne devra pas inventer les informations.
6.2 Analyse assistée par l’IA
L’IA pourra également aider à :
•	expliquer certains KPI ;
•	résumer une situation RH ;
•	comparer plusieurs périodes ;
•	identifier des tendances dans les données ;
•	fournir une synthèse compréhensible des résultats obtenus.
6.3 Génération de synthèses
L’utilisateur pourra demander à l’IA de produire une synthèse à partir des informations réellement présentes dans le système.
Exemple :
Résume-moi la situation des effectifs de cette année.
L’IA devra produire sa réponse uniquement à partir des données accessibles à l’utilisateur.
7. Prévisions et simulations
Dans une version avancée, l’application pourra intégrer des fonctionnalités prédictives.
Elle pourra notamment permettre :
•	la prévision des départs ;
•	la prévision de l’évolution des effectifs ;
•	la comparaison de plusieurs scénarios RH.
Exemples de scénarios :
•	aucun nouveau recrutement ;
•	remplacement des départs ;
•	recrutement d’un nombre défini d’agents.
La DRH pourra ainsi comparer les conséquences possibles de différentes décisions.
8. Règles de gestion
8.1 Gestion des accès
Chaque utilisateur ne doit accéder qu’aux informations autorisées par son rôle et son périmètre.
8.2 Confidentialité
Les informations individuelles des agents ne doivent pas être accessibles aux utilisateurs non autorisés.
8.3 Périmètre des chefs de service
Un Chef de service ne doit pas pouvoir consulter les données individuelles appartenant à un autre service.
8.4 Historique
Les changements importants concernant les agents doivent pouvoir être historisés.
8.5 Qualité des données
Les données utilisées pour les analyses doivent pouvoir faire l’objet de contrôles de qualité.
8.6 Calcul des indicateurs
Les KPI doivent être calculés à partir des données réellement enregistrées dans le système.
8.7 Intelligence artificielle
L’IA doit travailler sur les données disponibles et autorisées.
Elle ne doit pas présenter comme factuelle une information qui n’existe pas dans les données utilisées.
9. Parcours utilisateurs principaux
9.1 Connexion
Utilisateur → Page de connexion → Authentification → Tableau de bord correspondant à son rôle
9.2 Consultation du tableau de bord
Connexion → Dashboard → KPI → Graphiques → Alertes → Analyse détaillée
9.3 Consultation d’un agent
Agents → Recherche/Sélection → Fiche agent → Informations → Historique
9.4 Analyse des effectifs
Effectifs → Choix des critères → Analyse → Tableau/Graphique → Résultat
9.5 Contrôle qualité
Données → Contrôle qualité → Anomalies détectées → Consultation des anomalies
9.6 Utilisation de l’assistant IA
Assistant IA → Question de l’utilisateur → Recherche dans les données autorisées → Analyse → Réponse et visualisation
10. Pages / écrans principaux
L’application pourra être organisée autour des écrans fonctionnels suivants :
1.	Connexion
2.	Tableau de bord
3.	Agents
4.	Fiche d’un agent
5.	Directions
6.	Services
7.	Grades
8.	Catégories
9.	Statuts
10.	Effectifs
11.	Mouvements
12.	Carrières
13.	Absences et congés
14.	Formations
15.	Performances
16.	Qualité des données
17.	Importation des données
18.	KPI
19.	Alertes
20.	Rapports
21.	Assistant IA
22.	Administration
23.	Gestion des utilisateurs
24.	Gestion des rôles et permissions
11. Données principales à gérer
Le système devra notamment gérer les données relatives aux éléments suivants :
Données RH
•	agents ;
•	affectations ;
•	carrières ;
•	absences ;
•	formations ;
•	performances ;
•	rémunérations ;
•	mouvements.
Référentiels
•	directions ;
•	services ;
•	fonctions ;
•	grades ;
•	catégories ;
•	statuts ;
•	types d’absence ;
•	types de mouvement ;
•	formations ;
•	compétences.
Données système
•	utilisateurs ;
•	rôles ;
•	permissions ;
•	historique ;
•	imports ;
•	contrôles de qualité ;
•	alertes.
12. Exigences non fonctionnelles principales
Même si le projet est principalement fonctionnel, certaines exigences sont indispensables.
Sécurité
L’application doit protéger les données RH et appliquer strictement les autorisations de chaque utilisateur.
Responsive
L’interface web doit pouvoir s’adapter aux principales tailles d’écran.
Ergonomie
L’application doit être simple à comprendre et permettre d’accéder rapidement aux informations importantes.
Performance
Les tableaux de bord, recherches et analyses courantes doivent être utilisables de manière fluide.
Fiabilité
Les indicateurs affichés doivent être calculés à partir des données réellement présentes dans le système.
Traçabilité
Les informations importantes et leurs évolutions doivent pouvoir être retracées.
13. Périmètre de la V1 / MVP
La première version doit rester concentrée sur les fonctionnalités essentielles.
Elle comprendra :
1.	Authentification
2.	Tableau de bord
3.	Gestion des agents
4.	Directions
5.	Services
6.	Grades
7.	Import Excel/CSV
8.	Contrôle qualité des données
9.	Analyse des effectifs
10.	Gestion des mouvements
11.	KPI RH
12.	Système d’alertes
13.	Rapports
14.	Administration
15.	Gestion des rôles et permissions
Ce périmètre correspond au MVP recommandé dans le document initial.
14. Fonctionnalités prévues après la V1
Après validation de la première version, les fonctionnalités suivantes pourront être ajoutées progressivement :
Phase 2 — Analytics RH
•	carrières avancées ;
•	absences avancées ;
•	formations ;
•	compétences ;
•	performances ;
•	analyses détaillées.
Phase 3 — Intelligence décisionnelle
•	prévision des départs ;
•	prévision des effectifs ;
•	simulations ;
•	scénarios RH ;
•	scoring ;
•	assistant analytique IA ;
•	analyses et synthèses automatiques.
________________________________________
15. Technologies à utiliser
L’application reposera principalement sur les technologies suivantes :
Next.js
Utilisé pour développer :
•	l’application web ;
•	les interfaces ;
•	les tableaux de bord ;
•	les formulaires ;
•	les graphiques ;
•	les fonctionnalités côté serveur nécessaires à l’application.
Supabase
Utilisé pour :
•	la base de données ;
•	l’authentification ;
•	les utilisateurs ;
•	les rôles et permissions ;
•	la sécurisation de l’accès aux données ;
•	le stockage et l’accès aux données du système ;
•	les fonctions backend nécessaires.
API d’intelligence artificielle
Une API d’intelligence artificielle sera utilisée pour les fonctionnalités IA.
Le fournisseur pourra être choisi parmi :
•	OpenAI API ;
•	Claude API ;
•	DeepSeek API.
L’API IA sera principalement utilisée pour :
•	l’assistant analytique RH ;
•	l’interprétation des demandes en langage naturel ;
•	les synthèses ;
•	les explications d’indicateurs ;
•	l’analyse assistée des données ;
•	les futures fonctionnalités intelligentes.
________________________________________
16. Architecture simplifiée retenue
UTILISATEURS
     │
     ▼
NEXT.JS
Application Web
Interface + Dashboard + Logique métier
     │
     ▼
SUPABASE
Authentification + Base de données + Sécurité
     │
     ├───────────────┐
     ▼               ▼
DONNÉES RH       API IA
                 OpenAI
                 Claude
                 ou DeepSeek
________________________________________
17. Résultat attendu
À terme, SARH-AD devra constituer une plateforme unique permettant à la Direction des Ressources Humaines de :
Centraliser → Contrôler → Analyser → Visualiser → Alerter → Décider → Suivre
les principales données et activités RH de l’organisation.
La V1 sera entièrement construite avec Next.js et Supabase, tandis qu’une API IA externe — OpenAI, Claude ou DeepSeek — sera utilisée lorsque les fonctionnalités d’intelligence artificielle seront intégrées.
