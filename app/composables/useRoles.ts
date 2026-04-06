import { ROLE_GROUPS } from '~/composables/useRoleTypes'
import type { RoleGroup } from '~/composables/useRoleTypes'

export interface Role {
  id: string
  name_en: string
  name_ua: string
  description_en: string
  description_ua: string
  type: string
  edition: string
  image_url: string | null
}

export interface RoleGrouped {
  group: RoleGroup
  roles: Role[]
}

export function useRoles() {
  const client = useSupabaseClient()

  const filterType = ref<string | null>(null)
  const filterEdition = ref<string | null>(null)
  const searchQuery = ref('')

  const { data: roles, status } = useAsyncData('roles', async () => {
    const { data, error } = await client
      .from('roles')
      .select('id, name_en, name_ua, description_en, description_ua, type, edition, image_url')
      .order('type')
      .order('name_en')

    if (error) throw error
    return data as Role[]
  })

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

    return result
  })

  const groupedRoles = computed(() => {
    return ROLE_GROUPS
      .map(group => ({
        group,
        roles: filteredRoles.value.filter(r =>
          group.types.includes(r.type),
        ),
      }))
      .filter(g => g.roles.length > 0)
  })

  return {
    roles,
    filteredRoles,
    groupedRoles,
    filterType,
    filterEdition,
    searchQuery,
    status,
  }
}
