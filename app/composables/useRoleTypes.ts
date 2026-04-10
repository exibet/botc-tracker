export interface RoleTypeInfo {
  value: string
  label: string
  color: string
}

export interface EditionInfo {
  value: string
  label: string
}

export const ROLE_TYPES: RoleTypeInfo[] = [
  { value: 'townsfolk', label: 'Городяни', color: 'var(--color-townsfolk)' },
  { value: 'outsider', label: 'Чужинці', color: 'var(--color-outsider)' },
  { value: 'minion', label: 'Міньйони', color: 'var(--color-minion)' },
  { value: 'demon', label: 'Демони', color: 'var(--color-demon)' },
  { value: 'traveller', label: 'Мандрівники', color: 'var(--color-traveller)' },
  { value: 'fabled', label: 'Легендарні', color: 'var(--color-fabled)' },
]

export const EDITIONS: EditionInfo[] = [
  { value: 'tb', label: 'Trouble Brewing' },
  { value: 'bmr', label: 'Bad Moon Rising' },
  { value: 'snv', label: 'Sects & Violets' },
  { value: 'experimental', label: 'Experimental' },
  { value: 'ks', label: 'Kickstarter' },
  { value: 'base3', label: 'Base 3' },
]

export function getRoleTypeInfo(type: string): RoleTypeInfo | undefined {
  return ROLE_TYPES.find(t => t.value === type)
}

export function getRoleTypeColor(type: string): string {
  return getRoleTypeInfo(type)?.color ?? 'var(--color-text-muted)'
}

export function getRoleTypeTagClass(type: string): string {
  return `p-tag-${type.toLowerCase()}`
}

export function getRoleTypeLabel(type: string): string {
  return getRoleTypeInfo(type)?.label ?? type
}

export function getAlignmentForRoleType(
  type: string,
): 'good' | 'evil' | null {
  if (type === 'townsfolk' || type === 'outsider') return 'good'
  if (type === 'minion' || type === 'demon') return 'evil'
  return null
}

export function useRoleTypes() {
  return {
    roleTypes: ROLE_TYPES,
    editions: EDITIONS,
    getRoleTypeInfo,
    getRoleTypeColor,
    getRoleTypeTagClass,
  }
}
