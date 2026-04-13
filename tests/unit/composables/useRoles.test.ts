import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockRoles = [
  {
    id: 'role-1',
    name_en: 'Washerwoman',
    name_ua: 'Прачка',
    description_en: 'You start knowing...',
    description_ua: 'Ви починаєте знаючи...',
    type: 'townsfolk',
    edition: 'tb',
    image_url: null,
  },
  {
    id: 'role-2',
    name_en: 'Imp',
    name_ua: 'Імп',
    description_en: 'Each night...',
    description_ua: 'Щоночі...',
    type: 'demon',
    edition: 'tb',
    image_url: null,
  },
  {
    id: 'role-3',
    name_en: 'Drunk',
    name_ua: 'П\'яниця',
    description_en: 'You think you are...',
    description_ua: 'Ви думаєте що ви...',
    type: 'outsider',
    edition: 'tb',
    image_url: null,
  },
]

describe('useRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Pre-populate useState so initRoles is not needed in tests
    useState('roles').value = mockRoles
  })

  it('returns roles from useState', () => {
    const { roles } = useRoles()
    expect(roles.value).toEqual(mockRoles)
  })

  it('exports initRoles', () => {
    const result = useRoles()
    expect(result).toHaveProperty('initRoles')
  })

  it('filters by type', () => {
    const { filteredRoles, filterType } = useRoles()
    filterType.value = 'demon'
    expect(filteredRoles.value).toHaveLength(1)
    expect(filteredRoles.value[0].name_en).toBe('Imp')
  })

  it('filters by search query', () => {
    const { filteredRoles, searchQuery } = useRoles()
    searchQuery.value = 'імп'
    expect(filteredRoles.value).toHaveLength(1)
    expect(filteredRoles.value[0].name_en).toBe('Imp')
  })

  it('filters by edition', () => {
    const { filteredRoles, filterEdition } = useRoles()
    filterEdition.value = 'tb'
    expect(filteredRoles.value).toHaveLength(3)
  })

  it('sorts by Ukrainian name', () => {
    const { filteredRoles } = useRoles()
    const names = filteredRoles.value.map(r => r.name_ua)
    const sorted = [...names].sort((a, b) =>
      a.localeCompare(b, 'uk'),
    )
    expect(names).toEqual(sorted)
  })
})
