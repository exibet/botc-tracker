import type { Role } from '#shared/types'
import { ROLE_TYPES } from '~/composables/useRoleTypes'
import type { RoleTypeInfo } from '~/composables/useRoleTypes'
import { API } from '#shared/api'

export interface RoleGrouped {
  type: RoleTypeInfo
  roles: Role[]
}

export function useRoles() {
  const roles = useState<Role[] | null>('roles', () => null)

  async function initRoles() {
    if (roles.value) return
    roles.value = await $fetch<Role[]>(API.ROLES)
  }

  const filterType = ref<string | null>(null)
  const filterEdition = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredRoles = computed(() => {
    if (!roles.value) return []

    let result = roles.value

    if (filterType.value) {
      result = result.filter(r => r.type === filterType.value)
    }

    if (filterEdition.value) {
      result = result.filter(r => r.edition === filterEdition.value)
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter(r =>
        r.name_ua.toLowerCase().includes(q)
        || r.name_en.toLowerCase().includes(q),
      )
    }

    return result.toSorted((a, b) =>
      a.name_ua.localeCompare(b.name_ua, 'uk'),
    )
  })

  const groupedRoles = computed(() => {
    return ROLE_TYPES
      .map(type => ({
        type,
        roles: filteredRoles.value.filter(r =>
          r.type === type.value,
        ),
      }))
      .filter(g => g.roles.length > 0)
  })

  return {
    roles,
    initRoles,
    filteredRoles,
    groupedRoles,
    filterType,
    filterEdition,
    searchQuery,
  }
}
