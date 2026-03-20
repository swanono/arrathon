# Story 2.4: i18n & Localisation

Status: planned

## Story

As a developer,
I want the mobile app to use a proper i18n library (react-i18next or next-intl),
So that all user-facing strings are centralised, translatable, and easy to maintain.

## Acceptance Criteria

1. Given a string is displayed to the user, it comes from a translation key, never hardcoded
2. Given the default locale is French (fr), all existing strings are migrated to `fr` translation file
3. Given a new locale is added, only a new translation file is needed — no code changes
4. Given a component renders translated text, the API is `t('key')` or equivalent

## Tasks / Subtasks

- [ ] Task 1: Choose library + install
  - [ ] Install `react-i18next` + `i18next` (or `next-intl` if compatible with Expo Router)
  - [ ] Configure in `apps/mobile/src/i18n/index.ts`

- [ ] Task 2: Create French translation file
  - [ ] `apps/mobile/src/i18n/locales/fr.ts` — all strings from all existing screens

- [ ] Task 3: Migrate all screens
  - [ ] `(auth)/login.tsx` — "Se connecter avec Google"
  - [ ] `(app)/index.tsx` — "Mes Arrathons", "Créer", "Orga", "Participant", "Inviter des participants", empty/error states
  - [ ] `(app)/create-arrathon.tsx` — labels, placeholders, errors, button
  - [ ] `(app)/profile.tsx` — labels, logout button
  - [ ] `arrathon/[id].tsx` — "Retour", "Participants"

- [ ] Task 4: Type-safe keys
  - [ ] TypeScript types for translation keys to catch missing keys at compile time

## Dev Notes

### Library choice
Prefer `react-i18next` — mature, well-tested with React Native/Expo, large ecosystem.
`next-intl` is primarily for Next.js; Expo compatibility is not first-class.

### Scope
Only French for now. The structure unlocks future locales without code changes.

## Dev Agent Record

### Agent Model Used
N/A

### Completion Notes List

### File List
