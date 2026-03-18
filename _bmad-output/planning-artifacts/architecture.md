---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-03-17'
inputDocuments: ['_bmad-output/planning-artifacts/product-brief-arrathon-2026-03-17.md', '_bmad-output/brainstorming/brainstorming-session-2026-03-16-1200.md']
workflowType: 'architecture'
project_name: 'arrathon'
user_name: 'Sacha'
date: '2026-03-17'
---

# Architecture Decision Document

_Ce document se construit collaborativement étape par étape. Les sections sont ajoutées au fil des décisions architecturales._

## Project Context Analysis

### Requirements Overview

**Functional Requirements — MVP (Phase 0)**

| # | Fonctionnalité | Implication architecturale |
|---|---|---|
| FR1 | Auth OAuth Google + profil | Service auth, JWT, middleware |
| FR2 | Création arrathon + gestion participants | Domaine `Arrathon`, `Participant`, rôles par arrathon |
| FR3 | Gestion des lieux (CRUD, types, ordre) | Domaine `Location`, entité polymorphique (bar/appart/monument/ravitail) |
| FR4 | Finalisation lieu → notification groupe | Event interne + push notification |
| FR5 | Géolocalisation temps réel de tous les participants | WebSocket persistent, stockage lat/lng éphémère |
| FR6 | Validation lieu par géoloc (rayon) | Query géospatiale PostGIS (`ST_DWithin`) |
| FR7 | Pack de départ + statut paiement par participant | Domaine `Finance`, relation participant×arrathon |
| FR8 | Rejoindre en cours + abandon + retour | Statuts de participation, events métier |

**Non-Functional Requirements**

- **Temps réel** : géoloc mise à jour toutes les 10-30s, notifications push sub-seconde
- **Mobile-first** : Expo/React Native, iOS sans Mac → build EAS cloud
- **Réseau instable** : l'app doit rester lisible offline (cache local des lieux, carte dégradée)
- **Sécurité** : données de géoloc sensibles, autorisation par rôle dans le contexte d'un arrathon
- **Scale MVP** : ~10-50 participants par arrathon, 1-5 arrathons simultanés max

**Scale & Complexity**

- Complexité : **Medium**
- Domaine principal : **Mobile-first + API temps réel**
- Composants architecturaux estimés : 6-8

### Technical Constraints & Dependencies

- Pas de Mac → build iOS via EAS Build (Expo cloud)
- PostgreSQL existant → on garde, on ajoute PostGIS
- Monorepo Turborepo déjà en place → conservé
- OAuth Google déjà implémenté → à migrer vers Hono
- Zod déjà utilisé → conservé pour validation

### Cross-Cutting Concerns Identifiés

1. **Auth & autorisation** — double niveau : JWT global + rôle par arrathon (orga/participant)
2. **Temps réel** — WebSocket géoloc live + push notifications pour étapes
3. **Géospatial** — PostGIS pour validation de proximité et distances
4. **Architecture hexagonale** — isolation domaine/application/infrastructure
5. **Offline resilience** — liste des lieux et carte en cache local Expo

## Starter Template Evaluation

### Primary Technology Domain

Full-stack monorepo — Mobile (Expo) + API (Hono) — sur base Turborepo existante.

### Starter Options Considered

Pas de starter global unique — on ajoute deux apps au monorepo existant.

### Selected Starters

**Backend — Hono (remplace Fastify)**

```bash
npm create hono@latest apps/api
# runtime: nodejs, TypeScript
```

**Mobile — Expo React Native**

```bash
npx create-expo-app@latest apps/mobile --template blank-typescript
```

### Structure Monorepo Cible

```
arrathon/
├── apps/
│   ├── api/          ← Hono (nouveau, remplace backend/)
│   ├── mobile/       ← Expo React Native (nouveau)
│   └── backend/      ← Fastify (déprécié → supprimé après migration)
├── libs/
│   ├── db/           ← Drizzle schema + migrations (nouveau)
│   ├── eslint-config/
│   └── typescript-config/
└── turbo.json
```

### Migration depuis Fastify

| Élément | Action |
|---|---|
| OAuth Google | Migrer → implémentation Hono native + `arctic` lib |
| JWT | Migrer → `hono/jwt` middleware |
| Zod | Conserver → `@hono/zod-validator` |
| `db.ts` custom | Remplacer → Drizzle ORM dans `libs/db` |
| Logique métier (services/) | Reporter dans archi hexagonale |
| `apps/backend` | Supprimer après migration complète |

## Core Architectural Decisions

### Decision Priority Analysis

**Critical (bloquent l'implémentation) :**
- Stack backend : Hono + Node.js + Drizzle + PostgreSQL/PostGIS
- Stack mobile : Expo React Native + Expo Router
- Auth : OAuth Google + JWT (access 15min + refresh 30j cookie HttpOnly)
- Temps réel : WebSocket natif Hono par canal arrathon

**Important (façonnent l'architecture) :**
- UI : @rn-primitives + react-native-unistyles (pas de Tailwind, pas de CSS-in-JS runtime)
- State : Zustand
- Notifications : Expo Push Notifications
- Hosting : Railway

**Différé (Post-MVP) :**
- Redis (Phase 2+ si scaling nécessaire)
- Dashboard web orga (shadcn/ui + Radix + CSS modules)

### Data Architecture

- **ORM :** Drizzle ORM — schema TypeScript dans `libs/db`, type-safe, génère les migrations
- **Migrations :** Drizzle Kit (`generate` + apply manuel en dev, auto en CI)
- **Géospatial :** PostGIS — validation lieu par `ST_DWithin`, stockage `GEOGRAPHY(Point)`
- **Géoloc live :** Éphémère en mémoire serveur (Map JS par arrathon), non persisté en DB
- **Cache offline mobile :** AsyncStorage — liste des lieux persistée localement

### Authentication & Security

- **OAuth :** Google OAuth via `arctic` lib (Hono natif)
- **JWT :** Access token 15min + Refresh token 30j en cookie HttpOnly
- **Autorisation :** Middleware Hono par rôle/arrathon — vérifie le rôle dans le contexte de l'arrathon spécifique
- **Géoloc :** Données non persistées, transmises uniquement via WebSocket chiffré (WSS)

### API & Communication Patterns

- **Style :** REST pour CRUD + WebSocket pour géoloc live
- **WebSocket :** Canal par arrathon — `wss://api/arrathons/:id/live`, broadcast positions toutes les 10-30s
- **Push notifications :** Expo Push Notifications — `ExpoPushToken` stocké en DB par device
- **Erreurs :** Middleware Hono global → `{ error: string, code: string }`, HTTP standards

### Frontend Architecture (Mobile)

- **Routing :** Expo Router (file-based)
- **State global :** Zustand — user connecté, arrathon actif, participants live
- **UI Primitives :** @rn-primitives — composants headless accessibles
- **Styling :** react-native-unistyles — tokens de design, theming natif, dark mode, sans Tailwind
- **Carte :** react-native-maps + tuiles OpenStreetMap (gratuit)
- **Cache offline :** AsyncStorage pour liste des lieux

### Infrastructure & Deployment

- **Hosting API :** Railway — PostgreSQL managé + PostGIS, déploiement Git automatique
- **CI/CD :** GitHub Actions — tests + deploy sur push `main`
- **Environnements :** `dev` (local) + `prod` (Railway), pas de staging MVP
- **Mobile builds :** EAS Build (Expo cloud, gratuit projets perso, iOS sans Mac)
- **Redis :** Différé Phase 2+ (pas nécessaire pour instance unique MVP)

## Implementation Patterns & Consistency Rules

**6 zones de conflits potentiels identifiées** où des agents IA pourraient faire des choix divergents.

### Naming Patterns

**Conventions DB (Drizzle/PostgreSQL)**

| Élément | Convention | Exemple |
|---|---|---|
| Tables | `snake_case` pluriel | `users`, `arrathons`, `locations` |
| Colonnes | `snake_case` | `created_at`, `arrathon_id` |
| Foreign keys | `{table_singular}_id` | `user_id`, `arrathon_id` |
| Tables de liaison | `{table1}_{table2}` | `user_arrathons`, `arrathon_locations` |
| Index | `idx_{table}_{column}` | `idx_users_email` |

**Conventions API (Hono / REST)**

| Élément | Convention | Exemple |
|---|---|---|
| Routes | `kebab-case` pluriel | `/arrathons`, `/arrathons/:id/locations` |
| Path params | `:id` style Express | `:arrathonId`, `:locationId` |
| Query params | `camelCase` | `?includeInactive=true` |
| Headers custom | `X-` préfixe | `X-Refresh-Token` |

**Conventions code TypeScript**

| Élément | Convention | Exemple |
|---|---|---|
| Composants RN | `PascalCase` | `ArrathonCard`, `LocationPin` |
| Fichiers composants | `PascalCase.tsx` | `ArrathonCard.tsx` |
| Fonctions / variables | `camelCase` | `getArrathon`, `userId` |
| Types / Interfaces | `PascalCase` | `ArrathonWithLocations` |
| Fichiers non-composants | `kebab-case.ts` | `auth-middleware.ts`, `use-arrathon.ts` |
| Stores Zustand | `use{Domain}Store` | `useAuthStore`, `useArrathonStore` |
| Hooks custom | `use{Feature}` | `useGeolocation`, `useLiveParticipants` |

### Structure Patterns

**Architecture hexagonale — couches par package**

```
apps/api/src/
├── domain/               # Entités + règles métier pures (0 dépendance externe)
│   ├── arrathon/
│   ├── location/
│   └── user/
├── application/          # Use cases (orchestrent le domaine)
│   ├── arrathon/
│   └── location/
├── infrastructure/       # Adaptateurs (DB, WebSocket, Push, HTTP)
│   ├── db/               # Repositories Drizzle
│   ├── websocket/
│   ├── push/
│   └── http/             # Handlers Hono + middleware
└── index.ts
```

**Tests — co-location obligatoire**

```
src/domain/arrathon/arrathon.ts
src/domain/arrathon/arrathon.test.ts   ← co-localisé, pas dans __tests__/
```

**Libs partagées — libs/db**

```
libs/db/
├── schema/               # Tables Drizzle par domaine
│   ├── users.ts
│   ├── arrathons.ts
│   └── locations.ts
├── migrations/           # Générées par Drizzle Kit
└── index.ts              # Exports publics uniquement
```

### Format Patterns

**Format réponse API REST — enveloppe systématique**

```typescript
// Succès
{ "data": T, "meta"?: { "page": number, "total": number } }

// Erreur
{ "error": { "code": string, "message": string } }

// Exemple succès
{ "data": { "id": "uuid", "name": "Arrathon 20→1" } }

// Exemple erreur
{ "error": { "code": "ARRATHON_NOT_FOUND", "message": "Arrathon not found" } }
```

**Error codes — format `DOMAIN_ERROR` en SCREAMING_SNAKE_CASE**

```
ARRATHON_NOT_FOUND, LOCATION_ALREADY_VALIDATED, USER_NOT_PARTICIPANT
```

**Dates — ISO 8601 UTC systématique**

```typescript
"2026-03-17T14:30:00Z"   // ✅ toujours UTC
1710685800000             // ❌ timestamps numériques interdits
```

**JSON fields — camelCase côté API response**

```typescript
{ "arrathonId": "uuid", "createdAt": "2026-03-17T14:30:00Z" }
// Note: DB = snake_case, mais Drizzle mappe vers camelCase en TypeScript
```

### Communication Patterns

**Messages WebSocket — format unifié**

```typescript
interface WsMessage<T> {
  type: string           // "POSITION_UPDATE" | "LOCATION_VALIDATED" | "STEP_CHANGED"
  arrathonId: string
  senderId: string
  payload: T
  timestamp: string      // ISO 8601
}

// Exemple position
{
  "type": "POSITION_UPDATE",
  "arrathonId": "uuid",
  "senderId": "user-uuid",
  "payload": { "lat": 48.8566, "lng": 2.3522 },
  "timestamp": "2026-03-17T14:30:00Z"
}
```

**WS event types — SCREAMING_SNAKE_CASE**

```
POSITION_UPDATE, LOCATION_VALIDATED, STEP_CHANGED, PARTICIPANT_JOINED, PARTICIPANT_LEFT
```

**Organisation stores Zustand — par domaine, slices séparés**

```typescript
// ✅ Un store par domaine
useAuthStore     → { user, accessToken, login, logout }
useArrathonStore → { currentArrathon, locations, participants }
useLiveStore     → { positions: Map<userId, Position>, myPosition }

// ❌ Un mega-store global
useAppStore → { user, arrathon, positions, ... }
```

### Process Patterns

**Gestion d'erreurs — middleware global Hono**

```typescript
// Infrastructure layer — un seul point de transformation
app.onError((err, c) => {
  if (err instanceof DomainError) {
    return c.json({ error: { code: err.code, message: err.message } }, err.statusCode)
  }
  return c.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, 500)
})

// Domain layer — lancer des DomainError typées, jamais des strings
throw new DomainError("ARRATHON_NOT_FOUND", 404)
```

**Validation — Zod uniquement à la frontière HTTP (infrastructure)**

```typescript
// ✅ Validation dans le handler Hono (infrastructure)
const route = app.post("/arrathons", zValidator("json", createArrathonSchema), handler)

// ❌ Pas de validation Zod dans le domaine ou application layer
```

**Loading states — pattern Zustand uniforme**

```typescript
interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

const fetchArrathon = async (id: string) => {
  set({ isLoading: true, error: null })
  try {
    const data = await api.getArrathon(id)
    set({ data, isLoading: false })
  } catch (e) {
    set({ error: e.message, isLoading: false })
  }
}
```

**Auth flow — access token en mémoire, refresh token en cookie HttpOnly**

```typescript
// ✅ Access token stocké dans useAuthStore (mémoire, jamais localStorage)
// ✅ Refresh token envoyé automatiquement par le browser via cookie
// ✅ Intercepteur fetch : si 401 → tente refresh → retry → sinon logout
// ❌ Jamais stocker JWT dans AsyncStorage ou localStorage
```

### Enforcement Guidelines

**Tous les agents DOIVENT :**

- Utiliser l'enveloppe `{ data }` / `{ error }` pour toutes les réponses API REST
- Nommer les tables DB en `snake_case` pluriel, les colonnes en `snake_case`
- Co-localiser les tests avec les fichiers source (`.test.ts` à côté de `.ts`)
- Lancer des `DomainError` typées depuis le domaine, jamais des strings ou `Error` générique
- Utiliser `camelCase` pour les JSON fields en sortie d'API
- Préfixer les stores Zustand avec `use` et suffixer avec `Store`
- Stocker les dates en ISO 8601 UTC

**Anti-patterns à éviter :**

```typescript
// ❌ Réponse sans enveloppe
return c.json({ id: "uuid", name: "Arrathon" })
// ✅ Avec enveloppe
return c.json({ data: { id: "uuid", name: "Arrathon" } })

// ❌ Table nommée en PascalCase ou singulier
// CREATE TABLE "User" (...)
// ✅
// CREATE TABLE "users" (...)

// ❌ JWT dans AsyncStorage
// await AsyncStorage.setItem("token", jwt)
// ✅ Access token en mémoire Zustand seulement
// useAuthStore.setState({ accessToken: jwt })
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
arrathon/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Tests + lint sur PR
│       └── deploy.yml          # Deploy Railway sur push main
├── .env.example                # Variables d'env documentées (template)
├── package.json                # Workspace root
├── turbo.json                  # Pipeline Turborepo (build, test, lint)
├── tsconfig.base.json          # Config TS partagée
│
├── apps/
│   │
│   ├── api/                    # Hono — API REST + WebSocket
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env                # DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_*
│   │   ├── src/
│   │   │   ├── index.ts        # Entry point Hono, register routes + middleware
│   │   │   │
│   │   │   ├── domain/         # Entités + règles métier pures (0 import externe)
│   │   │   │   ├── user/
│   │   │   │   │   ├── user.ts              # Entité User
│   │   │   │   │   ├── user.test.ts
│   │   │   │   │   └── user-repository.ts   # Interface repository (port)
│   │   │   │   ├── arrathon/
│   │   │   │   │   ├── arrathon.ts          # Entité Arrathon + statuts
│   │   │   │   │   ├── arrathon.test.ts
│   │   │   │   │   ├── participant.ts       # Entité Participant + rôles
│   │   │   │   │   └── arrathon-repository.ts
│   │   │   │   ├── location/
│   │   │   │   │   ├── location.ts          # Entité Location + types (bar/appart/monument/ravitail)
│   │   │   │   │   ├── location.test.ts
│   │   │   │   │   └── location-repository.ts
│   │   │   │   └── errors/
│   │   │   │       └── domain-error.ts      # DomainError base class + codes
│   │   │   │
│   │   │   ├── application/    # Use cases (orchestrent domaine + ports)
│   │   │   │   ├── arrathon/
│   │   │   │   │   ├── create-arrathon.ts
│   │   │   │   │   ├── create-arrathon.test.ts
│   │   │   │   │   ├── join-arrathon.ts
│   │   │   │   │   ├── finalize-location.ts  # Finalise lieu → trigger push notif
│   │   │   │   │   └── update-location-order.ts
│   │   │   │   ├── location/
│   │   │   │   │   ├── validate-location.ts  # Validation géoloc (PostGIS)
│   │   │   │   │   └── validate-location.test.ts
│   │   │   │   └── auth/
│   │   │   │       ├── google-oauth.ts
│   │   │   │       └── refresh-token.ts
│   │   │   │
│   │   │   └── infrastructure/  # Adaptateurs (implémentent les ports)
│   │   │       ├── db/           # Repositories Drizzle
│   │   │       │   ├── user-repository.drizzle.ts
│   │   │       │   ├── arrathon-repository.drizzle.ts
│   │   │       │   └── location-repository.drizzle.ts
│   │   │       ├── websocket/
│   │   │       │   ├── live-handler.ts       # Hono WebSocket par arrathon
│   │   │       │   └── position-store.ts     # Map<arrathonId, Map<userId, Position>> en mémoire
│   │   │       ├── push/
│   │   │       │   └── expo-push.ts          # Expo Push Notifications client
│   │   │       └── http/
│   │   │           ├── middleware/
│   │   │           │   ├── auth-middleware.ts     # Vérifie JWT + injecte user dans context
│   │   │           │   ├── role-middleware.ts     # Vérifie rôle orga/participant par arrathon
│   │   │           │   └── error-middleware.ts    # Global error handler → { error }
│   │   │           └── routes/
│   │   │               ├── auth.routes.ts         # POST /auth/google, POST /auth/refresh
│   │   │               ├── arrathons.routes.ts    # CRUD /arrathons
│   │   │               ├── participants.routes.ts # /arrathons/:id/participants
│   │   │               └── locations.routes.ts    # /arrathons/:id/locations
│   │   └── Dockerfile
│   │
│   ├── mobile/                 # Expo React Native
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── app.json            # Config Expo (name, slug, version)
│   │   ├── eas.json            # Config EAS Build (profiles dev/prod)
│   │   ├── app/                # Expo Router — file-based routing
│   │   │   ├── _layout.tsx     # Root layout, providers (Zustand, unistyles)
│   │   │   ├── (auth)/
│   │   │   │   └── login.tsx   # Écran OAuth Google
│   │   │   └── (app)/          # Protégé par auth middleware
│   │   │       ├── _layout.tsx # Tab navigator
│   │   │       ├── index.tsx   # Home — liste des arrathons
│   │   │       ├── arrathon/
│   │   │       │   ├── [id].tsx           # Dashboard arrathon (carte live)
│   │   │       │   ├── [id]/locations.tsx # Liste des lieux
│   │   │       │   └── create.tsx         # Créer un arrathon
│   │   │       └── profile.tsx
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   ├── client.ts              # Fetch wrapper + intercepteur 401 → refresh
│   │   │   │   ├── arrathons.api.ts
│   │   │   │   └── auth.api.ts
│   │   │   ├── stores/                    # Zustand — un store par domaine
│   │   │   │   ├── use-auth-store.ts      # { user, accessToken, login, logout }
│   │   │   │   ├── use-arrathon-store.ts  # { currentArrathon, locations, participants }
│   │   │   │   └── use-live-store.ts      # { positions: Map, myPosition }
│   │   │   ├── hooks/
│   │   │   │   ├── use-geolocation.ts     # Expo Location, updates position
│   │   │   │   ├── use-websocket.ts       # Connexion WS live arrathon
│   │   │   │   └── use-location-validation.ts
│   │   │   ├── components/
│   │   │   │   ├── ui/                    # @rn-primitives + unistyles — atoms
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   └── Badge.tsx
│   │   │   │   ├── map/
│   │   │   │   │   ├── LiveMap.tsx        # react-native-maps + participants
│   │   │   │   │   └── LocationPin.tsx    # Marqueur lieu sur carte
│   │   │   │   ├── arrathon/
│   │   │   │   │   ├── ArrathonCard.tsx
│   │   │   │   │   └── ParticipantList.tsx
│   │   │   │   └── location/
│   │   │   │       ├── LocationItem.tsx
│   │   │   │       └── FinalizeButton.tsx
│   │   │   ├── styles/
│   │   │   │   └── unistyles.ts           # Tokens de design, breakpoints, themes
│   │   │   └── utils/
│   │   │       ├── offline-cache.ts       # AsyncStorage — cache liste des lieux
│   │   │       └── format-date.ts
│   │   └── assets/
│   │       └── images/
│   │
│   └── backend/                # ← Fastify DÉPRÉCIÉ — supprimer après migration
│
└── libs/
    ├── db/                     # Drizzle ORM — schema + migrations
    │   ├── package.json
    │   ├── drizzle.config.ts   # Config Drizzle Kit (connexion + output migrations)
    │   ├── schema/
    │   │   ├── users.ts        # Table users + expoPushTokens
    │   │   ├── arrathons.ts    # Tables arrathons + user_arrathons (roles)
    │   │   └── locations.ts    # Tables locations + arrathon_locations (order)
    │   ├── migrations/         # Générées par `drizzle-kit generate`
    │   └── index.ts            # Export: db client + tous les schemas
    ├── eslint-config/
    └── typescript-config/
```

### Architectural Boundaries

**Frontières API**

| Préfixe | Responsabilité | Auth requise |
|---|---|---|
| `POST /auth/*` | OAuth Google, refresh token | Non |
| `GET/POST /arrathons` | CRUD arrathons | JWT |
| `*/arrathons/:id/*` | Participants, lieux | JWT + rôle vérifié |
| `WSS /arrathons/:id/live` | Géoloc temps réel | JWT dans query param |

**Frontière domaine ↔ infrastructure**

- Le domaine ne connaît que des interfaces (ports) — `ArrathonRepository`, `PushService`
- L'infrastructure implémente ces interfaces avec Drizzle / Expo Push
- Les use cases (application) injectent les ports par constructeur

**Frontière API ↔ Mobile**

- Mobile consomme uniquement `{ data }` / `{ error }` — jamais de format brut
- Token d'accès envoyé dans `Authorization: Bearer` header
- Refresh token envoyé automatiquement en cookie HttpOnly

### Requirements → Structure Mapping

| FR | Use case | Fichiers principaux |
|---|---|---|
| FR1 Auth OAuth | `application/auth/google-oauth.ts` | `routes/auth.routes.ts`, `app/(auth)/login.tsx` |
| FR2 Arrathon + participants | `application/arrathon/create-arrathon.ts` | `domain/arrathon/`, `stores/use-arrathon-store.ts` |
| FR3 Gestion lieux | `domain/location/location.ts` | `routes/locations.routes.ts`, `components/location/` |
| FR4 Finalisation → push | `application/arrathon/finalize-location.ts` | `infrastructure/push/expo-push.ts` |
| FR5 Géoloc temps réel | `infrastructure/websocket/live-handler.ts` | `hooks/use-websocket.ts`, `stores/use-live-store.ts` |
| FR6 Validation géoloc | `application/location/validate-location.ts` | PostGIS `ST_DWithin`, `hooks/use-location-validation.ts` |
| FR7 Pack de départ | `libs/db/schema/arrathons.ts` | colonnes pack + payment_status dans `user_arrathons` |
| FR8 Rejoindre / abandon | `application/arrathon/join-arrathon.ts` | statuts dans `domain/arrathon/participant.ts` |

## Architecture Validation Results

### Coherence Validation ✅

| Vérification | Résultat |
|---|---|
| Hono + Node.js + `@hono/node-ws` (WebSocket adapter) | ✅ Compatible |
| Drizzle ORM + PostgreSQL/PostGIS | ✅ Compatible |
| Expo Router + Zustand + @rn-primitives + react-native-unistyles | ✅ Ecosystem RN sans conflit |
| JWT access (mémoire Zustand) + refresh (cookie HttpOnly) | ✅ Pattern sécurisé et cohérent |
| Turborepo + libs/db partagée | ✅ Monorepo structure valide |
| Arctic lib + Hono pour OAuth Google | ✅ Arctic agnostique au framework |

**Point de vigilance — WebSocket + JWT :** les clients WS ne supportent pas le header `Authorization` lors du handshake. Le JWT doit être passé en query param : `WSS /arrathons/:id/live?token=...` — à implémenter dans `role-middleware.ts`.

### Requirements Coverage Validation ✅

| FR | Couverture | Décision clé |
|---|---|---|
| FR1 Auth OAuth Google | ✅ | `application/auth/google-oauth.ts` + arctic + JWT |
| FR2 Arrathon + participants + rôles | ✅ | `domain/arrathon/` + `user_arrathons` table |
| FR3 Lieux CRUD + types + ordre | ✅ | `domain/location/` + `arrathon_locations` (order column) |
| FR4 Finalisation → push notification | ✅ | `finalize-location.ts` → `expo-push.ts` |
| FR5 Géoloc temps réel | ✅ | WebSocket par canal + `position-store.ts` en mémoire |
| FR6 Validation lieu par géoloc | ✅ | PostGIS `ST_DWithin` + `validate-location.ts` |
| FR7 Pack de départ + statut paiement | ✅ | Colonnes pack + `payment_status` dans `user_arrathons` |
| FR8 Rejoindre en cours + abandon + retour | ✅ | Statuts participant dans `domain/arrathon/participant.ts` |

**NFRs :** Temps réel ✅ · Mobile-first/iOS sans Mac ✅ · Offline resilience ✅ · Sécurité géoloc ✅ · Scale MVP ✅

### Gap Analysis

**Gaps importants — à adresser en début d'implémentation**

1. **Système d'invitation par lien** — ajouter colonne `invite_token` dans `arrathons` + route `GET /arrathons/join/:token` dans `join-arrathon.ts`
2. **`ExpoPushToken` dans le schéma DB** — ajouter table `device_tokens` (userId, token, platform) dans `libs/db/schema/users.ts`
3. **CORS Hono** — ajouter `@hono/cors` middleware dans `infrastructure/http/index.ts`

**Gaps mineurs**

- Variable `EXPO_PUBLIC_API_URL` à documenter dans `.env.example` mobile
- EAS Build nécessite un compte Apple Developer pour distribution TestFlight

### Architecture Completeness Checklist

- [x] Contexte projet analysé (FR1-FR8, NFRs, contraintes)
- [x] Complexité et scale évalués (Medium, MVP 10-50 participants)
- [x] Décisions critiques documentées avec stack complète
- [x] Patterns d'intégration définis (REST + WebSocket)
- [x] Sécurité couverte (JWT dual-token, géoloc éphémère, rôles par arrathon)
- [x] Conventions de nommage (DB, API, code TypeScript)
- [x] Structure hexagonale définie avec exemples
- [x] Error handling, loading states, validation documentés
- [x] Arborescence complète définie fichier par fichier
- [x] FR → fichiers mapping complet

### Architecture Readiness Assessment

**Statut global : READY FOR IMPLEMENTATION**

**Confiance : Haute**

**Points forts :**
- Architecture hexagonale stricte → domaine testable isolément, sans DB
- Géoloc éphémère → données sensibles non persistées
- Dual-token JWT → sécurité maximale sans friction UX
- Monorepo Turborepo → partage de types DB sans overhead

**À surveiller en Phase 1 :**
- Précision GPS indoor (bars, appartements) → prévoir fallback validation manuelle
- Performance WebSocket avec 50 clients simultanés

### Implementation Handoff

**Ordre de démarrage recommandé :**

```bash
# 1. Setup libs/db — Drizzle schema (base de tout)
# Créer libs/db/, schema users → arrathons → locations
# drizzle-kit generate && drizzle-kit migrate

# 2. Setup Hono API
npm create hono@latest apps/api  # runtime: nodejs

# 3. Migrer OAuth Google → arctic + Hono
# Puis supprimer apps/backend

# 4. Setup Expo Mobile
npx create-expo-app@latest apps/mobile --template blank-typescript
```

