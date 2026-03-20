# Story 3.6: Admin Role — Full Creator Rights

Status: planned

## Story

As the creator of an arrathon,
I want a dedicated admin role that gives me full control over the event,
So that I can delete the arrathon, manage organisers, and perform actions no other role can.

## Acceptance Criteria

1. Given I created an arrathon, my role in `user_arrathon` is `admin` (not `organisator`)
2. Given I am admin, I can delete the arrathon — `DELETE /arrathons/:id` hard-deletes it and cascades
3. Given I am admin, I can promote a participant to organisator
4. Given I am organisator (not admin), I cannot delete the arrathon — 403 returned
5. Given I am admin, the UI shows a "Supprimer l'arrathon" action with confirmation dialog
6. The existing `organisator` role remains — admins can add other organisators

## Tasks / Subtasks

- [ ] Task 1: DB — add `admin` value to `participant_role` enum
  - [ ] Drizzle schema: add `'admin'` to `participantRoleEnum`
  - [ ] Run `drizzle-kit generate && drizzle-kit migrate`

- [ ] Task 2: API — update `createArrathon` to insert creator as `admin`
  - [ ] Change `role: 'organisator'` → `role: 'admin'` in `arrathon.service.ts:createArrathon`

- [ ] Task 3: API — `DELETE /arrathons/:id`
  - [ ] Guard: only `admin` role can delete
  - [ ] Hard delete — cascade handles user_arrathon + arrathon_location

- [ ] Task 4: API — `PATCH /arrathons/:id/participants/:userId/role`
  - [ ] Admin only — promote participant → organisator

- [ ] Task 5: Mobile — update role badge display
  - [ ] Add `admin` badge (distinct from `Orga`) in home cards and dashboard

- [ ] Task 6: Mobile — delete action on dashboard
  - [ ] "Supprimer l'arrathon" button visible to admin only
  - [ ] Confirmation Alert before delete
  - [ ] On confirm: `DELETE /arrathons/:id` → navigate home

## Dev Notes

### DB enum change
`participant_role` enum currently: `['participant', 'organisator']`
New: `['participant', 'organisator', 'admin']`
Drizzle migration required — Railway prod migration must run before deploy.

### Backward compatibility
Existing arrathons created before this story have `organisator` role for the creator.
Migration script may be needed to upgrade them to `admin` if required.

### Role hierarchy (from most to least privileged)
`admin` > `organisator` > `participant`

## Dev Agent Record

### Agent Model Used
N/A

### Completion Notes List

### File List
