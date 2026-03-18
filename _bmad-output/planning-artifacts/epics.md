---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-03-17'
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-arrathon-2026-03-17.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - 'init-scripts/01-create-table.sql'
---

# arrathon - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for arrathon, decomposing the requirements from the Product Brief, Architecture, and existing DB schema into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Inscription / connexion OAuth Google + profil utilisateur minimal (nom, photo)
FR2: Créer un arrathon (nom, date, description, N organisateurs)
FR3: Inviter des participants via lien unique (invite token)
FR4: Rôles : organisateur / participant par arrathon
FR5: Rejoindre en cours de route + déclarer participation partielle (je commence au bar X)
FR6: Abandon d'un arrathon + retour possible
FR7: Créer / modifier / supprimer des lieux dans l'itinéraire (type : bar, appartement, monument, ravitail)
FR8: Ordonner les lieux et associer une adresse
FR9: Finaliser un lieu (bouton orga) → notification push → lieu suivant actif
FR10: Modifier l'ordre des lieux en live (remplacement si lieu fermé)
FR11: Carte live avec position de tous les participants
FR12: Filtre carte — afficher seulement certains participants
FR13: Validation d'un lieu par géolocalisation (rayon configurable)
FR14: Notifications push à chaque changement d'étape
FR15: L'orga définit un pack optionnel/obligatoire (écocup, dossard...) avec prix et contenu
FR16: Statut de paiement du pack par participant, visible par l'orga

### NonFunctional Requirements

NFR1: Géolocalisation mise à jour toutes les 10-30s, notifications push sub-seconde
NFR2: Mobile-first — Expo/React Native, iOS sans Mac via EAS Build cloud
NFR3: App lisible offline (cache local des lieux via AsyncStorage, carte dégradée)
NFR4: Données de géoloc sensibles — non persistées, WSS uniquement, autorisation par rôle/arrathon
NFR5: Scale MVP — ~10-50 participants par arrathon, 1-5 arrathons simultanés
NFR6: Test alpha 2 personnes — parcours complet de bout en bout sans bug bloquant avant vrai arrathon

### Additional Requirements

- AR1: Créer libs/db avec Drizzle ORM — migrer le schéma SQL existant (6 tables) vers Drizzle schema TypeScript
- AR2: Ajouter les colonnes manquantes au schéma : invite_token (arrathons), status participant (user_arrathon), colonnes pack/paiement, GEOGRAPHY(Point) pour PostGIS
- AR3: Créer la table device_tokens (userId, expoPushToken, platform)
- AR4: Setup apps/api avec Hono (remplace Fastify)
- AR5: Migrer OAuth Google Fastify → Hono + arctic lib
- AR6: Setup apps/mobile avec Expo React Native + Expo Router
- AR7: Configurer EAS Build (eas.json, profiles dev/prod)
- AR8: Setup GitHub Actions CI/CD (tests + deploy Railway sur push main)
- AR9: Configurer Railway deployment (PostgreSQL + PostGIS)
- AR10: Ajouter CORS middleware (@hono/cors) dans apps/api
- AR11: Supprimer apps/backend après migration complète

### UX Design Requirements

N/A — No UX Design document for this project.

### FR Coverage Map

```
FR1  → Epic 2 — OAuth Google + profil
FR2  → Epic 3 — Créer un arrathon
FR3  → Epic 3 — Lien d'invitation unique
FR4  → Epic 3 — Rôles orga/participant
FR5  → Epic 3 — Rejoindre en cours + participation partielle
FR6  → Epic 3 — Abandon + retour
FR7  → Epic 4 — CRUD lieux + types
FR8  → Epic 4 — Ordonnancement + adresse
FR9  → Epic 6 — Finaliser lieu → notification
FR10 → Epic 6 — Modifier ordre en live
FR11 → Epic 5 — Carte live positions
FR12 → Epic 5 — Filtre participants carte
FR13 → Epic 5 — Validation géoloc (rayon)
FR14 → Epic 6 — Push notifications étapes
FR15 → Epic 7 — Définir pack départ
FR16 → Epic 7 — Statut paiement pack

NFR1 → Epics 5 & 6 — Fréquence géoloc + latence push
NFR2 → Epic 1 — EAS Build configuration
NFR3 → Epic 5 — Cache offline AsyncStorage
NFR4 → Epic 5 — Géoloc éphémère + WSS + autorisation par rôle
NFR5 → Transversal — scale MVP géré architecturalement
NFR6 → Transversal — critère de sortie de chaque epic

AR1–AR11 → Epic 1 — Foundation & Infrastructure
```

## Epic List

### Epic 1: Foundation & Infrastructure Setup
Les développeurs peuvent faire tourner le projet complet de bout en bout — monorepo configuré, schéma DB migré vers Drizzle avec les nouvelles colonnes, API Hono fonctionnelle, app Expo bootée, OAuth migré, CI/CD en place.
**ARs couverts :** AR1, AR2, AR3, AR4, AR5, AR6, AR7, AR8, AR9, AR10, AR11

### Epic 2: User Authentication & Profile
Les utilisateurs peuvent se connecter avec Google, accéder à leur profil et naviguer dans l'app authentifiée.
**FRs couverts :** FR1

### Epic 3: Arrathon Creation & Participant Management
Les organisateurs peuvent créer un arrathon, inviter des participants via lien unique, gérer les rôles, et les participants peuvent rejoindre (y compris en cours de route), déclarer une participation partielle, abandonner ou revenir.
**FRs couverts :** FR2, FR3, FR4, FR5, FR6

### Epic 4: Itinerary & Locations Management
Les organisateurs peuvent construire et gérer l'itinéraire complet — créer, modifier, supprimer et ordonner les lieux (bar, appartement, monument, ravitail) avec adresse.
**FRs couverts :** FR7, FR8

### Epic 5: Live Event — Geolocation & Map
Tous les participants voient la carte live avec les positions en temps réel, peuvent filtrer les participants affichés, et valident leur présence à un lieu par géolocalisation. Fonctionne en mode dégradé offline.
**FRs couverts :** FR11, FR12, FR13
**NFRs couverts :** NFR1, NFR3, NFR4

### Epic 6: Event Progression & Push Notifications
Les organisateurs font avancer le groupe avec le bouton "Finaliser", peuvent modifier l'ordre en live (lieu fermé), et tout le monde reçoit des notifications push à chaque changement d'étape.
**FRs couverts :** FR9, FR10, FR14

### Epic 7: Pack & Logistics Management
Les organisateurs définissent un pack de départ (écocup, dossard...) optionnel ou obligatoire avec prix, et suivent le statut de paiement de chaque participant.
**FRs couverts :** FR15, FR16

---

## Epic 1: Foundation & Infrastructure Setup

Les développeurs peuvent faire tourner le projet complet de bout en bout — monorepo configuré, schéma DB migré vers Drizzle avec les nouvelles colonnes, API Hono fonctionnelle, app Expo bootée, OAuth migré, CI/CD en place.

### Story 1.1: Database Schema Migration to Drizzle ORM

As a developer,
I want the existing PostgreSQL schema migrated to Drizzle ORM with all new required columns,
So that the project has a type-safe, version-controlled database schema ready for all subsequent features.

**Acceptance Criteria:**

**Given** `libs/db` package is created in the monorepo
**When** `drizzle-kit generate && drizzle-kit migrate` is run
**Then** all 6 existing tables are reflected in Drizzle schema TypeScript (users, arrathons, locations, user_arrathon, location_user, arrathon_location)
**And** new columns are present: `invite_token` (unique) in arrathons, `status` enum (active/abandoned/returned/partial) in user_arrathon, pack columns (pack_included, pack_paid, pack_price) in user_arrathon
**And** `device_tokens` table is created (user_id, expo_push_token, platform, created_at)
**And** `GEOGRAPHY(Point)` column is added to locations for PostGIS
**And** TypeScript types are exported from `libs/db/index.ts`
**And** existing test data from `init-scripts/01-create-table.sql` is preserved

### Story 1.2: Hono API Bootstrap

As a developer,
I want `apps/api` set up with Hono + CORS + global error middleware,
So that the API server starts and handles requests consistently with the architectural patterns.

**Acceptance Criteria:**

**Given** `apps/api` is created with `npm create hono@latest` (runtime: nodejs)
**When** the server starts
**Then** `GET /health` returns `{ "data": { "status": "ok" } }`
**And** CORS is configured via `@hono/cors` for local mobile development
**And** the global error middleware transforms `DomainError` instances into `{ "error": { "code": string, "message": string } }`
**And** unknown errors return `{ "error": { "code": "INTERNAL_ERROR", "message": "Internal server error" } }` with HTTP 500
**And** `libs/db` is connected and the Drizzle client is accessible in the app
**And** the Turborepo pipeline builds `apps/api` correctly

### Story 1.3: OAuth Google Migration to Hono + Cleanup

As a developer,
I want the existing OAuth Google flow migrated from Fastify to Hono using the `arctic` library,
So that authentication works end-to-end on the new API and `apps/backend` can be deleted.

**Acceptance Criteria:**

**Given** `apps/api` has the Hono setup from Story 1.2
**When** a user hits `GET /auth/google`
**Then** the OAuth flow redirects to Google's authorization page
**And** the callback `GET /auth/google/callback` creates or updates the user in DB and issues tokens
**And** the JWT access token (15 min expiry) is returned in the response body
**And** the JWT refresh token (30 days) is set as an HttpOnly cookie
**And** `POST /auth/refresh` exchanges a valid refresh token for a new access token
**And** `apps/backend` (Fastify) is deleted from the monorepo

### Story 1.4: Expo Mobile App Bootstrap

As a developer,
I want `apps/mobile` set up with Expo Router, Zustand, @rn-primitives, and react-native-unistyles,
So that the mobile app boots on iOS and connects to the API.

**Acceptance Criteria:**

**Given** `apps/mobile` is created with `npx create-expo-app@latest --template blank-typescript`
**When** the app starts (Expo Go or EAS dev build)
**Then** Expo Router is configured with root layout, `(auth)` group (login screen) and `(app)` group (protected screens)
**And** `useAuthStore` (Zustand) is initialized and accessible throughout the app
**And** react-native-unistyles is configured with design tokens (colors, spacing, typography) and dark/light themes
**And** `EXPO_PUBLIC_API_URL` environment variable connects the app to `apps/api`
**And** `eas.json` is configured with `development` and `production` profiles

### Story 1.5: CI/CD Pipeline & Railway Deployment

As a developer,
I want GitHub Actions CI/CD configured with tests and Railway deployment,
So that every push to `main` triggers automated validation and deploys the API automatically.

**Acceptance Criteria:**

**Given** `.github/workflows/ci.yml` and `deploy.yml` exist
**When** a PR is opened against `main`
**Then** lint and unit tests run automatically and block merge on failure
**And** when a PR is merged to `main`, the API deploys automatically to Railway
**And** Railway is configured with PostgreSQL + PostGIS enabled
**And** environment variables (DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are set in Railway
**And** `GET /health` on the Railway URL returns `{ "data": { "status": "ok" } }`

---

## Epic 2: User Authentication & Profile

Les utilisateurs peuvent se connecter avec Google, accéder à leur profil et naviguer dans l'app authentifiée.

### Story 2.1: Google Sign-In Screen & Auth Flow (Mobile)

As a user,
I want to sign in with my Google account from the mobile app,
So that I can access the Arrathon app without creating a separate account.

**Acceptance Criteria:**

**Given** I open the app for the first time (unauthenticated)
**When** I tap "Se connecter avec Google"
**Then** the Google OAuth flow opens in a browser/webview
**And** after successful Google authorization, I am redirected back to the app
**And** my JWT access token is stored in `useAuthStore` (memory only, not AsyncStorage)
**And** the refresh token is set as an HttpOnly cookie
**And** I am redirected to the app home screen `(app)/index`

**Given** I reopen the app after a previous session
**When** the app starts
**Then** if a valid refresh token cookie exists, a new access token is fetched automatically
**And** I am taken directly to the home screen without seeing the login screen

### Story 2.2: User Profile Screen

As a user,
I want to see my profile with my name and photo from Google,
So that I can confirm my identity and access account settings.

**Acceptance Criteria:**

**Given** I am authenticated
**When** I navigate to my profile screen
**Then** I see my name, family name, and avatar photo (from Google)
**And** I see a "Se déconnecter" button

**Given** I tap "Se déconnecter"
**When** the action is confirmed
**Then** my access token is cleared from `useAuthStore`
**And** the refresh token cookie is invalidated via `POST /auth/logout`
**And** I am redirected to the login screen

### Story 2.3: JWT Refresh & Auth Guard

As a user,
I want my session to stay active seamlessly without being logged out unexpectedly,
So that I can use the app throughout a full arrathon day without interruption.

**Acceptance Criteria:**

**Given** my access token has expired (after 15 min)
**When** the app makes any authenticated API request
**Then** the fetch interceptor in `api/client.ts` detects the 401 response
**And** automatically calls `POST /auth/refresh` using the cookie
**And** retries the original request with the new access token
**And** if the refresh token is also expired, redirects me to the login screen

**Given** I try to access a protected screen `(app)/*` while unauthenticated
**When** Expo Router evaluates the route
**Then** I am redirected to `(auth)/login` automatically

---

## Epic 3: Arrathon Creation & Participant Management

Les organisateurs peuvent créer un arrathon, inviter des participants via lien unique, gérer les rôles, et les participants peuvent rejoindre (y compris en cours de route), déclarer une participation partielle, abandonner ou revenir.

### Story 3.1: Create an Arrathon

As an organiser,
I want to create a new arrathon with a name, date, and description,
So that I can set up the event and become its first organiser.

**Acceptance Criteria:**

**Given** I am authenticated and on the home screen
**When** I tap "Créer un arrathon" and fill in the name, date, and optional description
**Then** `POST /arrathons` creates the arrathon in DB
**And** I am automatically added to `user_arrathon` with role `organisator`
**And** the new arrathon appears in my list of arrathons on the home screen
**And** I am navigated to the arrathon dashboard screen

**Given** I submit the form with a missing required field (name or date)
**When** the validation runs
**Then** an inline error message is shown and the request is not sent

### Story 3.2: Invite Participants via Unique Link

As an organiser,
I want to generate and share a unique invite link for my arrathon,
So that participants can join without needing an account beforehand.

**Acceptance Criteria:**

**Given** I am an organiser of an arrathon
**When** I tap "Inviter des participants"
**Then** I see the unique invite link (based on `invite_token`)
**And** I can copy it or share it via the native share sheet

**Given** a user opens the invite link `arrathon://join/:token` (or deep link)
**When** the app handles the deep link
**Then** if the user is authenticated, `GET /arrathons/join/:token` adds them as a `participant`
**And** if the user is not authenticated, they are redirected to login then automatically joined after auth
**And** if the token is invalid, an error message is shown

### Story 3.3: Arrathon Home Screen & Participant List

As a participant or organiser,
I want to see the arrathon details and the list of participants with their roles,
So that I know who is part of the event and in what capacity.

**Acceptance Criteria:**

**Given** I am a member of an arrathon
**When** I open the arrathon dashboard
**Then** I see the arrathon name, date, and description
**And** I see a list of all participants with their name, avatar, and role (organisateur/participant)
**And** the list updates when new participants join

**Given** I am on the home screen
**When** the app loads
**Then** I see all arrathons I belong to (as organiser or participant)

### Story 3.4: Join In Progress & Declare Partial Participation

As a participant,
I want to join an arrathon that has already started and declare which bar I'm starting from,
So that my participation is tracked correctly even if I join mid-event.

**Acceptance Criteria:**

**Given** I join via invite link after the arrathon has started
**When** I am added as a participant
**Then** I see a prompt: "À partir de quel lieu rejoins-tu ?" listing only locations from the current active location onwards (already finalized locations are excluded)
**And** my `status` in `user_arrathon` is set to `active` with a `starting_location_id` recorded
**And** I appear in the participant list with a "partial" indicator

**Given** I join without specifying a starting location
**When** I confirm
**Then** I am added as a full participant from the beginning (no `starting_location_id`)

### Story 3.5: Abandon & Return

As a participant,
I want to be able to abandon an arrathon and optionally return later,
So that my status accurately reflects my presence throughout the event.

**Acceptance Criteria:**

**Given** I am an active participant in an arrathon
**When** I tap "Abandonner l'arrathon" and confirm
**Then** my `status` in `user_arrathon` is updated to `abandoned`
**And** I no longer appear on the live map for other participants
**And** I still have read-only access to the arrathon screen

**Given** my status is `abandoned` and I want to come back
**When** I tap "Rejoindre à nouveau"
**Then** I see the same prompt as Story 3.4: only locations from the current active location onwards are available
**And** my `status` is updated back to `active` with the new `starting_location_id`
**And** I reappear on the live map

### Story 3.6: Add & Manage Co-Organisers

As an organiser,
I want to promote a participant to organiser and demote an organiser to participant,
So that the arrathon can have multiple organisers who share control of the event.

**Acceptance Criteria:**

**Given** I am an organiser of an arrathon
**When** I tap on a participant in the list and select "Promouvoir organisateur"
**Then** `PATCH /arrathons/:id/participants/:userId/role` updates their role to `organisator`
**And** they can now access organiser actions (finalize location, reorder, manage pack)

**Given** I am an organiser and want to demote another organiser
**When** I tap on them and select "Rétrograder participant"
**Then** their role is updated to `participant`
**And** if they are the only remaining organiser, the demotion is blocked with an error: "Un arrathon doit avoir au moins un organisateur"

**Given** I try to demote myself
**When** I select "Rétrograder participant" on my own entry
**Then** the action is blocked with an error: "Vous ne pouvez pas vous rétrograder vous-même"

---

## Epic 5: Live Event — Geolocation & Map

Tous les participants voient la carte live avec les positions en temps réel, peuvent filtrer les participants affichés, et valident leur présence à un lieu par géolocalisation. Fonctionne en mode dégradé offline.

### Story 5.1: Live Map with Participant Positions

As a participant or organiser,
I want to see all active participants on a live map with their positions updated in real time,
So that I always know where the group is without asking on WhatsApp.

**Acceptance Criteria:**

**Given** I am an active participant in an ongoing arrathon
**When** I open the map screen
**Then** I see all active participants as pins on the map with their avatar and name
**And** positions update automatically every 10-30 seconds via WebSocket (`WSS /arrathons/:id/live`)
**And** participants with status `abandoned` do not appear on the map
**And** the current active location is highlighted on the map

**Given** my WebSocket connection drops
**When** connectivity is restored
**Then** the app reconnects automatically and resumes receiving position updates

### Story 5.2: Broadcast My Own Position

As a participant,
I want the app to send my GPS position to the group automatically while I'm active,
So that others can see where I am on the live map.

**Acceptance Criteria:**

**Given** I am an active participant with location permissions granted
**When** the map screen is open
**Then** `useGeolocation` sends my position via WebSocket as `POSITION_UPDATE` every 10-30 seconds
**And** my position is stored ephemerally in server memory only (never persisted to DB)
**And** my position is transmitted only over WSS (encrypted)

**Given** I have not granted location permissions
**When** the map screen loads
**Then** I am prompted to grant permissions
**And** if I deny, I can still see others on the map but my pin does not appear
**And** a banner indicates "Votre position n'est pas partagée"

### Story 5.3: Filter Participants on the Map

As a participant,
I want to filter which participants are shown on the map,
So that I can focus on tracking just my close friends in a large group.

**Acceptance Criteria:**

**Given** I am on the map screen
**When** I tap the filter icon
**Then** I see a list of all active participants with toggle switches
**And** I can select/deselect individual participants
**And** only selected participants' pins are shown on the map
**And** my filter preference is persisted locally (AsyncStorage) for the session

**Given** I have applied a filter and a new participant joins
**When** their position appears
**Then** they are shown by default (not filtered out) until I explicitly deselect them

### Story 5.4: Validate a Location by Geolocation

As a participant,
I want to validate that I have reached a location by being physically close to it,
So that my presence at each step of the arrathon is confirmed.

**Acceptance Criteria:**

**Given** I am within the configured radius of the active location (default: 100m)
**When** I tap "Valider ce lieu"
**Then** `POST /arrathons/:id/locations/:locationId/validate` calls PostGIS `ST_DWithin` to confirm proximity
**And** the location is marked as validated for me in the DB
**And** a success confirmation is shown

**Given** I am outside the configured radius
**When** I tap "Valider ce lieu"
**Then** the API returns `LOCATION_TOO_FAR` and a message is shown: "Vous n'êtes pas assez proche du lieu"
**And** the map zooms to show the distance between my position and the target

**Given** the location list is cached in AsyncStorage (offline mode)
**When** I have no network connection
**Then** I can still see the list of locations and the map with the last known positions
**And** validation attempts are queued and retried when connectivity returns

### Story 5.5: Organiser Validates a Location on Behalf of a Participant

As an organiser,
I want to manually validate a location for a participant who was present but couldn't validate via GPS,
So that their participation is correctly recorded despite indoor GPS limitations.

**Acceptance Criteria:**

**Given** I am an organiser and a participant has not validated a location
**When** I open the participant's validation details
**Then** I see a list of locations with their validation status per participant
**And** for any unvalidated location, I see a "Valider à la place" button

**Given** I tap "Valider à la place" for a participant
**When** the confirmation modal opens
**Then** the timestamp is pre-filled with the later of: my own validation time for that location OR the participant's previous location validation/finalization time
**And** I can edit the timestamp freely
**And** if the entered timestamp is before the participant's previous location validation time, it is rejected with "L'heure doit être postérieure à la validation du lieu précédent"
**And** if the entered timestamp is after the participant's next validated location time, it is rejected with "L'heure doit être antérieure à la validation du lieu suivant"
**And** on confirm, `POST /arrathons/:id/locations/:locationId/validate-for/:userId` saves the validation with a `manually_validated_by` flag referencing my user ID

**Given** the location was never validated by any organiser
**When** I tap "Valider à la place"
**Then** the timestamp defaults to the location's finalization time
**And** the same timestamp coherence rules apply

---

## Epic 6: Event Progression & Push Notifications

Les organisateurs font avancer le groupe avec le bouton "Finaliser", peuvent remplacer un lieu en live, et tout le monde reçoit des push notifications à chaque changement d'étape.

### Story 6.1: Finalize a Location & Advance the Group

As an organiser,
I want to finalize the current location to signal the group it's time to move to the next one,
So that everyone gets notified automatically without me sending a WhatsApp message.

**Acceptance Criteria:**

**Given** I am an organiser and there is an active location
**When** I tap "Finaliser ce lieu" and confirm
**Then** `POST /arrathons/:id/locations/:locationId/finalize` marks the location as finalized
**And** the next location in `order_position` becomes the active location
**And** a push notification is sent to all active participants: "➡️ On part au prochain lieu : [name]"
**And** the finalized location can no longer be edited, deleted, or reordered
**And** if it was the last location, the arrathon is marked as completed

### Story 6.2: Replace a Location in Live (Lieu Fermé)

As an organiser,
I want to swap a not-yet-reached location for a different one during the event,
So that the group can adapt if a bar is closed or a plan changes on the fly.

**Acceptance Criteria:**

**Given** I am an organiser and a non-finalized location needs to be swapped
**When** I tap "Remplacer ce lieu" and fill in the new location details
**Then** the existing location is replaced with the new one at the same `order_position`
**And** a push notification is sent to all active participants: "🔄 Changement : [old name] remplacé par [new name]"
**And** all participants see the updated itinerary immediately

**Given** I try to replace an already finalized location
**When** I attempt the action
**Then** it is blocked — finalized locations cannot be replaced

### Story 6.3: Push Notification Registration

As a participant,
I want to register my device for push notifications when I join an arrathon,
So that I receive real-time alerts even when the app is in the background.

**Acceptance Criteria:**

**Given** I join an arrathon for the first time on my device
**When** the app requests notification permissions
**Then** if I grant permission, my `ExpoPushToken` is saved via `POST /users/me/push-token` into `device_tokens`
**And** if I deny, I can still use the app but a banner warns "Notifications désactivées — vous pourriez manquer les changements d'étape"

**Given** my push token changes (app reinstall, device change)
**When** the app starts
**Then** the token is updated automatically via `POST /users/me/push-token` (upsert)

---

## Epic 7: Pack & Logistics Management

Les organisateurs définissent un pack de départ, désignent le commandeur (celui qui a avancé l'argent), et les participants déclarent leur paiement — base pour le Tricount de fin d'événement.

### Story 7.1: Define a Starting Pack & Designate the Commander

As an organiser,
I want to define a starting pack with price, contents, and designate who ordered and paid upfront for the group,
So that everyone knows what they owe and to whom.

**Acceptance Criteria:**

**Given** I am an organiser on the arrathon settings screen
**When** I configure the pack (price, contents description, mandatory/optional) and designate a commander from the participant list
**Then** `POST /arrathons/:id/pack` saves the pack configuration with `commander_user_id`
**And** all participants see the pack details and the commander's name ("Pack commandé par [name]")
**And** the pack price is stored in `pack_price` on `user_arrathon` for each participant

**Given** I update the pack details after creation
**When** I save the changes
**Then** the updated pack is reflected for all participants
**And** already-declared payment statuses are preserved

**Given** I set the pack as mandatory
**When** a new participant joins
**Then** they are informed of the mandatory pack, its price, and who to pay

### Story 7.2: Declare & Track Pack Payment

As a participant or organiser,
I want to declare that I have paid for my pack, and see who still owes the commander,
So that unpaid amounts are clearly tracked for the end-of-event settlement.

**Acceptance Criteria:**

**Given** a pack is configured and I am a participant (including organisers)
**When** I tap "J'ai payé mon pack"
**Then** `PATCH /arrathons/:id/participants/:userId/pack-status` sets my status to `paid`
**And** the commander's summary updates: "X/Y participants ont payé"

**Given** I am an organiser
**When** a participant tells me in person they've paid
**Then** I can mark them as paid on their behalf via the same endpoint
**And** an organiser can reset a payment status to `unpaid` if needed

**Given** there is no pack configured for the arrathon
**When** I view the participants list
**Then** no payment status section is shown

**Given** the arrathon ends
**When** I view the pack summary
**Then** I see the full list: who paid, who didn't, and who the commander is — ready to feed into a Tricount

---

## Epic 4: Itinerary & Locations Management

Les organisateurs peuvent construire et gérer l'itinéraire complet — créer, modifier, supprimer et ordonner les lieux (bar, apartment, monument, pit_stand) avec adresse et hôtes pour les appartements.

> **Location types:** `bar` | `apartment` | `monument` | `pit_stand`
> Apartment locations can have one or more hosts assigned from registered participants (via `location_user` table).

### Story 4.1: Add a Location to the Itinerary

As an organiser,
I want to add a new location to the arrathon itinerary with a name, address, and type,
So that participants know where the group is heading at each step.

**Acceptance Criteria:**

**Given** I am an organiser on the locations screen
**When** I tap "Ajouter un lieu" and fill in the name, address, and type (`bar`, `apartment`, `monument`, or `pit_stand`)
**Then** `POST /arrathons/:id/locations` creates the location and adds it to the end of the itinerary
**And** the new location appears at the bottom of the ordered list with its type icon

**Given** I submit without a name or type
**When** the validation runs
**Then** an inline error is shown and the request is not sent

### Story 4.2: Edit & Delete a Location

As an organiser,
I want to edit or delete a location in the itinerary,
So that I can correct mistakes or remove a location that is no longer relevant.

**Acceptance Criteria:**

**Given** I am an organiser and a location has not yet been finalized
**When** I tap on a location and select "Modifier"
**Then** I can update the name, address, or type
**And** `PATCH /arrathons/:id/locations/:locationId` saves the changes
**And** the updated location is reflected immediately in the list for all participants

**Given** I tap "Supprimer" on a non-finalized location
**When** I confirm the deletion
**Then** `DELETE /arrathons/:id/locations/:locationId` removes it
**And** the `order_position` of remaining locations is recalculated

**Given** a location has already been finalized
**When** I try to edit or delete it
**Then** the action is blocked — finalized locations are immutable

### Story 4.3: Assign Hosts to an Apartment Location

As an organiser,
I want to assign one or more registered participants as hosts of an apartment location,
So that everyone knows whose place it is and can reach them directly.

**Acceptance Criteria:**

**Given** I add or edit a location with type `apartment`
**When** I tap "Assigner des hôtes"
**Then** I see a list of participants already registered in the arrathon
**And** I can select one or more participants as hosts
**And** `POST /arrathons/:id/locations/:locationId/hosts` saves the relationship in `location_user`
**And** the apartment displays the host name(s) in the location list and on the map

**Given** I remove a host from an apartment
**When** I deselect them and confirm
**Then** the `location_user` entry is deleted
**And** if no hosts remain, the apartment still exists but shows "Hôte non assigné"

**Given** the location type is `bar`, `monument`, or `pit_stand`
**When** I view the location details
**Then** no host assignment option is shown

### Story 4.4: Reorder Locations

As an organiser,
I want to drag and drop locations to reorder the itinerary,
So that I can adjust the route order before or during the event.

**Acceptance Criteria:**

**Given** I am an organiser on the locations screen
**When** I drag a location to a new position
**Then** `PATCH /arrathons/:id/locations/reorder` saves the new `order_position` values for all affected locations
**And** the updated order is reflected immediately for all participants

**Given** a location has already been finalized
**When** I try to drag it
**Then** it cannot be moved — its position is locked
