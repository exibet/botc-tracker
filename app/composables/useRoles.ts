import type { Role } from '~/types'
import { ROLE_TYPES } from '~/composables/useRoleTypes'
import type { RoleTypeInfo } from '~/composables/useRoleTypes'

export interface RoleGrouped {
  type: RoleTypeInfo
  roles: Role[]
}

export function useRoles() {
  const client = useSupabaseClient()
  const roles = useState<Role[] | null>('roles', () => null)

  async function initRoles() {
    if (roles.value) return

    const { data, error } = await client
      .from('roles')
      .select('id, name_en, name_ua, description_en, description_ua, type, edition, image_url')
      .order('type')
      .order('name_en')

    if (error) throw error
    roles.value = data as Role[]
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
