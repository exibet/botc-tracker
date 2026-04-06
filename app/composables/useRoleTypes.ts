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
  { value: 'outsider', label: 'Аутсайдери', color: 'var(--color-outsider)' },
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

export interface RoleGroup {
  key: string
  label: string
  types: string[]
}

export const ROLE_GROUPS: RoleGroup[] = [
  { key: 'good', label: 'Добро', types: ['townsfolk', 'outsider'] },
  { key: 'evil', label: 'Зло', types: ['minion', 'demon'] },
  { key: 'neutral', label: 'Нейтральні', types: ['traveller'] },
  { key: 'rare', label: 'Рідкісні', types: ['fabled'] },
]

export function getRoleTypeTagClass(type: string): string {
  return `p-tag-${type.toLowerCase()}`
}

export function useRoleTypes() {
  return {
    roleTypes: ROLE_TYPES,
    editions: EDITIONS,
    roleGroups: ROLE_GROUPS,
    getRoleTypeInfo,
    getRoleTypeColor,
    getRoleTypeTagClass,
  }
}
