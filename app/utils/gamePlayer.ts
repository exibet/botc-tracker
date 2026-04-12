import type { GamePlayerWithDetails } from '~/composables/useGamePlayers'
import { gamePoints } from '~/utils/stats'

export function didWin(
  entry: GamePlayerWithDetails,
  winner: 'good' | 'evil' | null,
): boolean | null {
  if (!winner) return null
  const alignment = entry.alignment_end ?? entry.alignment_start
  if (!alignment) return null
  return alignment === winner
}

export function canEdit(
  entry: GamePlayerWithDetails,
  currentUserId: string | null,
  isAdmin: boolean,
  gameStatus: string,
): boolean {
  if (!currentUserId) return false
  if (isAdmin) return true
  if (gameStatus !== 'in_progress') return false
  return entry.player.id === currentUserId
}

export function canDelete(
  entry: GamePlayerWithDetails,
  currentUserId: string | null,
  isAdmin: boolean,
  gameStatus: string,
): boolean {
  if (isAdmin) return true
  if (gameStatus === 'finished') return false
  if (!currentUserId) return false
  return entry.player.id === currentUserId
}

export function hasRole(entry: GamePlayerWithDetails): boolean {
  return !!entry.starting_role
}

export function hasRoleChange(entry: GamePlayerWithDetails): boolean {
  return !!(
    entry.starting_role
    && entry.ending_role
    && entry.ending_role.id !== entry.starting_role.id
  )
}

export function hasAlignmentChange(entry: GamePlayerWithDetails): boolean {
  return !!(
    entry.alignment_end
    && entry.alignment_end !== entry.alignment_start
  )
}

export function hasAnyChange(entry: GamePlayerWithDetails): boolean {
  return hasRoleChange(entry) || hasAlignmentChange(entry)
}

export function finalRole(entry: GamePlayerWithDetails) {
  if (hasRoleChange(entry)) return entry.ending_role!
  return entry.starting_role
}

export function finalAlignment(entry: GamePlayerWithDetails) {
  return hasAlignmentChange(entry)
    ? entry.alignment_end!
    : entry.alignment_start
}

export function entryPoints(
  entry: GamePlayerWithDetails,
  winner: 'good' | 'evil' | null,
): number {
  return gamePoints(
    didWin(entry, winner),
    entry.ending_role?.type ?? null,
    entry.starting_role?.type ?? null,
  )
}
