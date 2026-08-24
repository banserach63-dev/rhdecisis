# SARH-AD — Système Analytique RH d'Aide à la Décision

Application web (Next.js 16 + Supabase) permettant à une Direction des Ressources
Humaines de centraliser, fiabiliser, analyser et exploiter ses données RH :
agents, effectifs, mouvements, carrières, absences, formations, performances,
qualité des données, KPI, alertes, rapports et assistant analytique IA.
Voir `cahier-des-charges.md` pour le détail fonctionnel complet.

## 1. Prérequis

- Node.js 20+
- Un projet [Supabase](https://supabase.com) (gratuit pour démarrer)
- Une clé API [Anthropic](https://console.anthropic.com/) (optionnelle, pour l'Assistant IA)

## 2. Configuration

Copiez `.env.local.example` vers `.env.local` et renseignez :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
```

Les clés `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` se trouvent
dans **Project Settings → API** de votre projet Supabase. `SUPABASE_SERVICE_ROLE_KEY`
est nécessaire pour la création de comptes (Administration) — gardez-la strictement
côté serveur, ne l'exposez jamais au client.

## 3. Base de données

Le schéma complet (tables, enums, RLS, fonctions RBAC/KPI, triggers d'audit) se
trouve dans `supabase/migrations/0001_init.sql`, et des données de référence /
démonstration dans `supabase/seed.sql`.

**Avec la CLI Supabase :**

```bash
npx supabase login
npx supabase link --project-ref <votre-ref-projet>
npx supabase db push
psql "$(npx supabase db url)" -f supabase/seed.sql   # optionnel : jeu de démo
```

**Ou directement depuis le SQL Editor de Supabase :** collez et exécutez le
contenu de `supabase/migrations/0001_init.sql`, puis (optionnel) de `supabase/seed.sql`.

## 4. Lancer l'application

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). Comme aucun utilisateur
n'existe encore, la page de connexion propose de **créer le compte
administrateur** initial. Toute création d'utilisateur supplémentaire se fait
ensuite depuis *Administration → Utilisateurs*.

## 5. Rôles

`admin`, `drh`, `responsable_rh`, `chef_service`, `direction_generale`, `agent` —
chacun avec un périmètre de données strictement appliqué par les policies RLS
(`agent_in_scope`, `scope_in_perimeter` dans la migration). Un chef de service ne
peut par exemple jamais consulter les agents d'un autre service.

## 6. Scripts

```bash
npm run dev     # serveur de développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # ESLint
```

## 7. Stack technique

- **Next.js 16** (App Router, Server Actions, Turbopack) — voir les notes de
  version dans `node_modules/next/dist/docs/` pour les évolutions par rapport
  aux versions antérieures (`proxy.ts` remplace `middleware.ts`, `cookies()`
  asynchrone, etc.)
- **Supabase** (PostgreSQL, Auth, Row Level Security) pour les données et le contrôle d'accès
- **Anthropic Claude API** pour l'Assistant Analytique RH
- **Tailwind CSS v4**, **Recharts**, **lucide-react**
