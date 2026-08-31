

## 1. Proposition A — « Executive RH » — ma recommandation

C'est celle que je privilégierais.

### Identité visuelle

* **Bleu nuit** : confiance, institutionnel
* **Bleu électrique** : action et données
* **Vert** : indicateurs positifs
* **Orange** : vigilance
* **Rouge** : risque
* Fond gris très clair
* Cartes blanches avec ombres très légères
* Coins arrondis mais moins prononcés qu'actuellement

### Principe

L'écran doit répondre immédiatement à 3 questions :

> **Où en sommes-nous ?**
> **Qu'est-ce qui mérite mon attention ?**
> **Quelle décision dois-je prendre ?**

---

# 2. Repenser complètement le Dashboard

Actuellement, vous avez beaucoup de cartes KPI empilées.

Je réduirais leur nombre.

### Nouvelle première ligne

```text
┌──────────────────────────────────────────────────────────────┐
│ Bonjour Rachid                                               │
│ Situation RH au 31 août 2026                  [Filtres ▼]    │
├────────────┬────────────┬────────────┬────────────┬──────────┤
│ EFFECTIF   │ TURNOVER   │ ABSENTÉISME│ FORMATION  │ ALERTES  │
│ 128        │ 9,1 %      │ 0,7 %      │ 72 %       │ 5        │
│ +3,2 %     │ ↓ 1,4 pt   │ ↑ 0,2 pt   │ +8 %       │ 2 🔴     │
└────────────┴────────────┴────────────┴────────────┴──────────┘
```

Le changement important :

### Ajouter la tendance

Au lieu de :

> Turnover : **9,1 %**

mettre :

> **9,1 %**
> ↓ 1,4 point vs année précédente

Cela donne immédiatement du **sens décisionnel** à l'indicateur.

---

# 3. Ajouter un bloc « À retenir »

C'est probablement l'amélioration UX la plus importante.

Sous les KPI :

```text
┌─────────────────────────────────────────────────────────────┐
│ ✦ À RETENIR                                                 │
│                                                             │
│ ● L'effectif a augmenté de 3,2 % depuis janvier             │
│ ● Le turnover diminue de 1,4 point                          │
│ ● 8 agents atteindront une échéance de carrière            │
│ ● Le service X présente une hausse de 18 % de l'absence    │
│                                                             │
│                         Voir les analyses →                  │
└─────────────────────────────────────────────────────────────┘
```

La DRH n'a alors pas besoin d'analyser 15 graphiques pour comprendre la situation.

---

# 4. Ajouter « Alertes & actions »

Votre système doit distinguer **information** et **action**.

### Exemple

```text
ALERTES RH

🔴 3 critiques
────────────────────────────
Départs à la retraite
8 agents concernés

[Analyser]

🟠 5 vigilance
────────────────────────────
Hausse absentéisme
Service Informatique

[Analyser]

🟢 12 informations
────────────────────────────
Échéances de carrière
12 agents

[Voir]
```

L'utilisateur doit pouvoir passer directement :

**Alerte → Analyse → Action**

---

# 5. Transformer les graphiques en outils d'analyse

Votre graphique « Évolution des effectifs » est actuellement assez classique.

Je proposerais :

```text
ÉVOLUTION DES EFFECTIFS

140 ┤                           ●
135 ┤                      ●────
130 ┤                ●─────
125 ┤          ●─────
120 ┤────●─────
    └────────────────────────────
     Jan Fév Mar Avr Mai Juin ...
```

Avec au-dessus :

**128 agents**

**+4,8 % sur 12 mois**

Et des filtres :

```text
[12 mois ▼] [Direction ▼] [Service ▼]
```

---

# 6. Ajouter une vraie « Pyramide des âges »

Pour une DRH, c'est beaucoup plus pertinent qu'un simple graphique de répartition.

```text
        PYRAMIDE DES ÂGES

60+       ██       █
55-59     ███      ██
50-54     █████    ███
45-49     ██████   █████
40-44     ███████  ██████
35-39     ████████ ███████
30-34     █████    ██████
25-29     ███      ████
```

Cela permet ensuite de faire émerger :

> **27 % des agents ont plus de 50 ans**

et éventuellement :

> **15 départs potentiels dans les 5 prochaines années**

Là, on commence réellement à entrer dans l'**aide à la décision**.

---

# 7. Repenser le menu latéral

Votre sidebar est fonctionnelle mais un peu longue.

Je la réorganiserais ainsi :

```text
SARH-AD

▣ TABLEAU DE BORD

PILOTAGE
  ◉ Vue RH
  ◉ Effectifs
  ◉ Mouvements
  ◉ Carrières

GESTION RH
  ◉ Agents
  ◉ Absences & congés
  ◉ Formations
  ◉ Performances

ANALYTIQUE
  ◉ Analyses
  ◉ Indicateurs
  ◉ Alertes
  ◉ Prévisions

DONNÉES
  ◉ Qualité des données
  ◉ Importation
  ◉ Historique

ADMINISTRATION
  ◉ Utilisateurs
  ◉ Rôles & permissions
  ◉ Paramètres
```

Cela crée une logique beaucoup plus claire :

**Piloter → Gérer → Analyser → Contrôler → Administrer**

---

# 8. Ajouter une barre de recherche globale

Très utile dans une application RH.

En haut :

```text
⌕ Rechercher un agent, un service, une analyse...
```

L'utilisateur peut taper :

> « OUEDRAOGO »

et obtenir :

```text
AGENTS
├── OUEDRAOGO Paul
├── OUEDRAOGO Issaka

SERVICES
└── Service administratif

ANALYSES
└── Effectifs du service administratif
```

---

# 9. Ajouter des filtres globaux

Je recommande une barre persistante :

```text
Période       Direction       Service       Statut
[2026 ▼]      [Toutes ▼]      [Tous ▼]      [Tous ▼]
```

Ainsi, lorsque la DRH sélectionne :

> Direction : Direction financière

tous les KPI et graphiques se mettent à jour.

C'est beaucoup plus puissant UX qu'avoir des filtres indépendants partout.

---

# 10. Donner une personnalité à SARH-AD

Votre interface est actuellement assez « logiciel administratif ».

Je lui donnerais une identité de **plateforme décisionnelle moderne**.

Par exemple :

### SARH-AD

**Système Analytique RH d'Aide à la Décision**

Puis une signature :

> **Des données fiables. Des décisions éclairées.**

Ou :

> **Transformer les données RH en décisions.**

---

# 11. Ajouter un « Score RH »

Une fonctionnalité intéressante pour votre projet.

```text
┌───────────────────────────┐
│      SCORE RH             │
│                           │
│          82               │
│       / 100               │
│                           │
│  ● Effectifs       91     │
│  ● Carrières       78     │
│  ● Absences        84     │
│  ● Formation       76     │
│  ● Données         93     │
└───────────────────────────┘
```

Attention : ce score doit être **transparent et paramétrable**, avec une méthode de calcul documentée. Il ne doit pas devenir une « boîte noire ».

---

# 12. Ajouter une page « Analyse »

Je créerais une page spécifique :

## ANALYSE RH

```text
Que souhaitez-vous analyser ?

[ Effectifs                         ▼ ]

Période
[ Janvier 2026 → Août 2026 ]

Périmètre
[ Toute l'organisation             ▼ ]

                    [Lancer l'analyse]
```

Résultat :

```text
RÉSULTAT

L'effectif a progressé de 4,2 %.

Principaux facteurs :
• 7 recrutements
• 2 mutations entrantes
• 3 départs

Impact :
La croissance concerne principalement
les services A et B.
```

---

# 13. Ajouter progressivement un assistant IA

Un bouton flottant existe déjà sur votre capture.

Je le conserverais, mais je lui donnerais une vraie fonction :

**Assistant SARH-AD**

Exemple :

> « Quels services ont le plus fort taux d'absentéisme ? »

Réponse :

```text
ANALYSE

Les 3 services ayant le taux
d'absentéisme le plus élevé sont :

1. Service A — 8,7 %
2. Service B — 7,9 %
3. Service C — 7,2 %

Le service A connaît une hausse
de 18 % par rapport à 2025.

[Voir le détail]
```

---

# 14. Une meilleure fiche Agent

Au lieu d'une simple fiche administrative :

```text
OUEDRAOGO PAUL
────────────────────────────

Informations
Matricule : 000128
Fonction : ...
Grade : ...
Service : ...

────────────────────────────

SITUATION
Ancienneté       11 ans
Absences          4 jours
Formations        3
Performance       87 %

────────────────────────────

PARCOURS

2015 ─ Recrutement
2018 ─ Avancement
2021 ─ Mutation
2024 ─ Promotion
2026 ─ Fonction actuelle
```

Avec des onglets :

**Profil | Carrière | Absences | Formations | Performance | Historique**

---

# 15. Amélioration UX très importante : « progressive disclosure »

Ne montrez pas tout immédiatement.

La DRH voit d'abord :

**128 agents**

Puis clique :

**Effectifs →**

et obtient :

* par sexe ;
* par âge ;
* par grade ;
* par direction ;
* par service ;
* évolution.

Puis :

**Service A →**

et seulement à ce moment-là les informations détaillées apparaissent.

Cela réduit énormément la charge cognitive.

---

# 16. Design system recommandé

Je partirais sur quelque chose comme :

```text
COULEUR PRINCIPALE
#0B1F3A

COULEUR ACTION
#146EF5

SUCCÈS
#16A34A

VIGILANCE
#F59E0B

CRITIQUE
#DC2626

FOND
#F5F7FA

CARTE
#FFFFFF

TEXTE PRINCIPAL
#0F172A

TEXTE SECONDAIRE
#64748B
```

Typographie :

**Inter** ou **Manrope**

avec une hiérarchie très nette entre :

* titre ;
* KPI ;
* sous-titre ;
* données ;
* annotations.

---

# 17. Ma recommandation finale

Je ferais évoluer votre SARH-AD vers cette structure :

```text
                    SARH-AD
                       │
 ┌─────────────────────┼─────────────────────┐
 │                     │                     │
DONNÉES              ANALYSE              DÉCISION
 │                     │                     │
Agents              KPI                   Alertes
Effectifs           Tendances             Risques
Carrières            Comparaisons           Actions
Absences             Segmentation            Scénarios
Formations           Prévisions              Recommandations
 │                     │                     │
 └─────────────────────┼─────────────────────┘
                       │
                    IA RH
                       │
               Assistant analytique
```

**Le changement majeur que je recommande :** ne plus concevoir SARH-AD comme une succession de modules RH, mais comme un **cockpit de décision** dont les modules alimentent une même chaîne analytique.

