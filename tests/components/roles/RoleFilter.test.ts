import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RoleFilter from '~/components/roles/RoleFilter.vue'

describe('roleFilter', () => {
  it('renders all filter controls', async () => {
    const wrapper = await mountSuspended(RoleFilter, {
      props: {
        filterType: null,
        filterEdition: null,
        searchQuery: '',
      },
    })
    const selects = wrapper.findAll('[data-pc-name="select"]')
    expect(selects.length).toBe(2)

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toContain('Пошук')
  })

  it('emits search query on input', async () => {
    const wrapper = await mountSuspended(RoleFilter, {
      props: {
        filterType: null,
        filterEdition: null,
        searchQuery: '',
      },
    })
    const input = wrapper.find('input')
    await input.setValue('Емпат')
    expect(wrapper.emitted('update:searchQuery')).toBeTruthy()
  })
})
