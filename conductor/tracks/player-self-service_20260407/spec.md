# Specification: Player Self-Service

**Track ID:** player-self-service_20260407
**Type:** Feature
**Created:** 2026-04-07
**Status:** Draft

## Summary

Add player self-service to the game detail page: logged-in players can join a game (select role + alignment) and edit their own entry. Integrates into existing game detail UI and uses existing composables/components.

## Context

Games CRUD is fully implemented with admin-only create/edit. The `GamePlayersTable` component displays players on the detail page. The `useGamePlayers` composable has `add()`, `update()`, and `remove()` methods already available. RLS policies in Supabase already allow players to insert/update/delete their own `game_players` rows.

## User Stories

- As a **Player**, I want to join a game from the detail page by selecting my role and alignment, so that I don't need an admin to add me.
- As a **Player**, I want to edit my own game entry (role, alignment, alive/dead) so that I can correct mistakes.
- As an **Admin**, I want to keep full control via the existing edit page (already implemented).

## Acceptance Criteria

- [ ] Logged-in player sees "Join Game" button on game detail if not already in the game
- [ ] Join dialog shows only role picker and alignment selector (no user selection)
- [ ] After joining, the player appears in the GamePlayersTable immediately
- [ ] Player can edit their own entry inline or via dialog (role, alignment, alive/dead, MVP)
- [ ] Player cannot edit other players' entries
- [ ] Guest sees no action buttons
- [ ] Admin capabilities unchanged (edit page still works as before)

## Dependencies

- Existing: `useGamePlayers` composable (add/update methods)
- Existing: `RolePickerPanel` component
- Existing: `AlignmentTag` component
- Existing: Supabase RLS policies for `game_players` (player self-insert/update)

## Out of Scope

- Admin game edit page changes (already works)
- Player deletion of own entry (admin-only for now)
- Ending role / alignment change tracking in self-service (admin handles via edit page)

## Technical Notes

- Reuse `RolePickerPanel` for role selection in join dialog
- Use `useGamePlayers().add()` for join, `.update()` for edit
- `added_by` field set to current user's profile ID
- Refresh player list after mutations via existing composable refresh
