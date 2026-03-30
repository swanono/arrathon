# Story 4.5: Inline Reorder (Dashboard FlatList Refactor)

Status: done

## Story

As an organiser,
I want to reorder locations directly in the dashboard without navigating to a separate screen,
So that the reorder experience feels native and immediate.

## Context

Currently (4.4), reorder lives in a dedicated screen (`/reorder-locations`).
The root cause is that `DraggableFlatList` cannot be nested inside a `ScrollView`.

The fix: convert the dashboard from `ScrollView` to `FlatList` with:
- `ListHeaderComponent` → arrathon name, date, locations section header
- `DraggableFlatList` as the list itself (locations)
- `ListFooterComponent` → participants section

This removes the need for a separate reorder screen entirely.

## Acceptance Criteria

1. Given I am an organiser, I tap "☰ Ordre" → drag handles appear inline on each location row
2. Given I drag a location, it reorders immediately in the list
3. Given I tap "Enregistrer", order is saved and handles disappear
4. Given I tap "Annuler", order reverts and handles disappear
5. The separate `/reorder-locations` screen is removed

## Tasks / Subtasks

- [ ] Task 1: Refactor dashboard `[id]/index.tsx`
  - [ ] Replace `ScrollView` with `FlatList` structure
  - [ ] `ListHeaderComponent`: back button, title, date, section header (lieux + buttons)
  - [ ] Replace locations `View` with `DraggableFlatList` inline
  - [ ] `ListFooterComponent`: participants section
  - [ ] Reorder mode: toggle handles ☰ inline, Enregistrer/Annuler buttons in header
  - [ ] Call `reorderLocations` on save, revert local state on cancel

- [ ] Task 2: Remove `/reorder-locations` screen
  - [ ] Delete `app/arrathon/[id]/reorder-locations.tsx`
  - [ ] Remove "☰ Ordre" navigation button from dashboard header

## Dev Notes

- `DraggableFlatList` supports `ListHeaderComponent` and `ListFooterComponent` natively
- Keep `reorderLocations` API call unchanged
- Reorder mode local state: copy of locations array, restored on cancel
