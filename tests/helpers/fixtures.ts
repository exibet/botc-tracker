/**
 * Shared test fixtures — single source of truth for IDs, profiles, etc.
 * Prevents duplication of literal UUIDs and profile objects across tests.
 */

export const VALID_UUID = '12345678-1234-1234-1234-123456789abc'
export const SECOND_UUID = '87654321-4321-4321-4321-cba987654321'
export const INVALID_UUID = 'not-a-uuid'

export const ADMIN_PROFILE = { id: 'admin-id', role: 'admin', nickname: 'Admin' }
export const USER_PROFILE = { id: 'user-id', role: 'player', nickname: 'User' }
export const OTHER_USER_PROFILE = { id: 'other-id', role: 'player', nickname: 'Other' }
