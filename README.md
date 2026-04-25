# findr — frontend

> *let others search for you*
> Marketplace inversée du vintage et de la pop culture — Made with ❤️ in France

Front React/TS du projet **findr**. Les acheteurs (*buyrs*) publient leurs recherches d'objets, les chineurs (*findrs*) proposent des trouvailles. Commission sur transaction validée.

- Site officiel : https://lovable.dev/projects/c1c8beb3-6c62-49c1-93d0-f11dd5b5e606
- Maquette / preview : https://byoo.com (déploiement de Thierry, miroir du Lovable)
- Repo : `thierryhuynh/findr-connection-finder` (privé) — *à transférer sur le compte de Thomas plus tard*
- Contexte projet complet : voir `../CLAUDE.md` (package parent `D:\Documents\01_Projets\FINDR\`)

---

## Stack

| | |
|---|---|
| **Build** | Vite 5 |
| **Langage** | TypeScript 5.8 |
| **UI** | React 18 + Tailwind 3.4 + shadcn/ui (Radix UI) |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **State serveur** | TanStack React Query 5 |
| **Formulaires** | React Hook Form 7 + Zod 3 |
| **Routing** | React Router 6 |
| **Animations** | Framer Motion 12 |
| **Tests** | Vitest 3 + Testing Library + jsdom |
| **Package manager** | Bun (recommandé) ou npm |

---

## Setup local

### Pré-requis
- **Node.js 20+** (ou Bun)
- Compte Supabase avec accès au projet `kfnggqhawjvzgajakbgd` (demander à Thierry / Olga / Thomas)

### Installation

```bash
# Cloner
git clone https://github.com/thierryhuynh/findr-connection-finder.git
cd findr-connection-finder

# Variables d'environnement
cp .env.example .env
# (les valeurs par défaut pointent sur la prod Supabase — OK pour démarrer)

# Dépendances
npm install        # ou : bun install

# Dev server (http://localhost:8080)
npm run dev        # ou : bun dev
```

### Variables d'environnement

Cf. `.env.example` :

| Variable | Rôle | Public ? |
|---|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase | ✅ public |
| `VITE_SUPABASE_PROJECT_ID` | ID du projet Supabase | ✅ public |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key Supabase (JWT role=anon) | ✅ public |

Ces 3 variables sont publiques par design. La sécurité repose sur les **Row Level Security policies** définies dans `supabase/migrations/`.

⚠️ **Ne jamais commiter** une `service_role` key ou un secret backend dans ce repo.

---

## Structure

```
frontend-lovable/
├── src/
│   ├── pages/                   # 17 pages (Index, Searches, PostSearch, ...)
│   ├── components/              # composants UI (shadcn dans /ui)
│   ├── hooks/                   # custom hooks (useAuth, ...)
│   ├── integrations/supabase/   # client Supabase + types générés
│   ├── lib/                     # utils
│   ├── App.tsx                  # routing principal
│   └── main.tsx                 # entry point
├── supabase/
│   ├── config.toml
│   └── migrations/              # 15 migrations SQL versionnées
├── public/                      # statiques (favicon, robots.txt)
├── .env.example                 # template des variables d'env
├── package.json
└── vite.config.ts
```

### Schéma BDD (9 tables Supabase)

| Table | Rôle |
|---|---|
| `profiles` | Profil utilisateur étendu (xp_points, level, is_findr) |
| `searches` | Recherches publiées par les buyrs |
| `proposals` | Propositions des findrs |
| `reservations` | Demandes de réservation exclusive |
| `messages` | Messagerie buyr↔findr (Supabase realtime) |
| `notifications` | Notifications utilisateur |
| `evaluations` | Évaluations / réputation (rating 1-5) |
| `favorites` | Favoris |
| `waitlist` | Liste d'attente pré-MVP (email + role) |

RLS activée sur toutes les tables. Realtime activé sur `messages` et `reservations`.

---

## Scripts

```bash
npm run dev          # dev server Vite (port 8080)
npm run build        # build prod → dist/
npm run build:dev    # build mode dev (debug-friendly)
npm run preview      # serveur statique de dist/
npm run lint         # ESLint
npm run test         # Vitest (unique)
npm run test:watch   # Vitest watch mode
```

---

## Déploiement

Le déploiement vers `https://byoo.com` est géré par le script **`deploy.sh`** à la racine du package parent (`D:\Documents\01_Projets\FINDR\`) :

```bash
cd ..              # remonter au package
./deploy.sh        # pull + build + push tar+ssh vers kms3 + tests curl
./deploy.sh --no-pull   # skip git pull (modifs locales en cours)
```

Le script :
1. `git pull --ff-only` ici dans `frontend-lovable/`
2. `npm run build`
3. Génère un `.htaccess` SPA (force HTTPS + fallback vers `index.html` + cache assets)
4. Push tar+ssh vers `kms3:/home/byoocom/public_html/`
5. Tests `curl` sur `/`, `/comment-ca-marche`, `/recherches`

À long terme, la prod ira sur un cloud public (OVHcloud / Scaleway / AWS — à arbitrer).

---

## Workflow Lovable ↔ GitHub

Sync **bidirectionnelle** :
- Une modif côté **Lovable** → push automatique sur GitHub `main`.
- Un push côté **GitHub** → reflété dans Lovable au prochain reload.

Donc on peut bosser indifféremment depuis Lovable (no-code) ou depuis un IDE local. Les deux convergent.

---

## Documentation projet

- `../CLAUDE.md` — contexte complet du projet (vision, équipe, stack, livrables, KPI, journal de décisions)
- `../memory.md` — journal des sessions Claude
- `../Documents/Business-Plan-findr.pdf` — Business Plan officiel
- `../Documents/extraction-site-lovable.md` — extraction Markdown de toutes les pages du site

---

## Équipe

- **Olga Tarasevich** — co-fondatrice, communication / luxe / communauté / marketing.
- **Thomas Huynh** — co-fondateur, développement plateforme et app mobile.
- **Thierry Huynh** — accompagnement technique sur le démarrage.
