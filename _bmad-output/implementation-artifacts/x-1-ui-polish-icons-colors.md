# Story X.1: UI Polish — Icons, Colors & Design Consistency

Status: planned

## Story

As a user,
I want the app to look polished and consistent,
So that it feels professional and pleasant to use on event day.

## Acceptance Criteria

1. Given any screen, all icons are rendered correctly (no broken/missing icons)
2. Given light and dark mode, colors are semantically correct and accessible
3. Given any interactive element (button, card, input), the design is consistent with the design system
4. Given the tab bar, icons match the screen intent and are visually distinct active vs inactive

## Tasks / Subtasks

- [ ] Task 1: Audit all icons
  - [ ] Inventory all icon usages across screens
  - [ ] Replace broken/placeholder icons with correct ones (choose icon library: `@expo/vector-icons` or `lucide-react-native`)

- [ ] Task 2: Color system review
  - [ ] Audit `apps/mobile/src/theme/themes.ts` — verify all color tokens are used consistently
  - [ ] Fix any hardcoded colors in components
  - [ ] Validate contrast ratios for accessibility

- [ ] Task 3: Button design consistency
  - [ ] Standardise primary / secondary / danger button styles
  - [ ] Verify 3D shadow effect is consistent (`btn3dPrimary`)

- [ ] Task 4: Screen layout review
  - [ ] Add safe area insets where missing (top/bottom)
  - [ ] Consistent padding/margin using theme spacing tokens
  - [ ] Fix any overflow or clipped content on small screens

- [ ] Task 5: Tab bar icons
  - [ ] Accueil tab — choose appropriate icon
  - [ ] Profil tab — choose appropriate icon

## Dev Notes

### Icon library
Prefer `lucide-react-native` — consistent, tree-shakeable, works with Expo.
`@expo/vector-icons` is already bundled with Expo if we want to avoid adding deps.

### Design tokens
All styling MUST use `useTheme()` + `makeStyles(theme)` pattern — no hardcoded values.

## Dev Agent Record

### Agent Model Used
N/A

### Completion Notes List

### File List
