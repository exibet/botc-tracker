import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RoleCard from '~/components/roles/RoleCard.vue'

const mockRole = {
  id: 'empath',
  name_en: 'Empath',
  name_ua: 'Емпат',
  description_en: 'Each night, you learn how many of your alive neighbours are evil.',
  description_ua: 'Кожної ночі ви дізнаєтесь, скільки ваших живих сусідів є злими.',
  type: 'townsfolk',
  edition: 'tb',
  image_url: 'https://example.com/empath.png',
}

const mockRoleNoImage = {
  ...mockRole,
  id: 'spy',
  name_ua: 'Шпигун',
  name_en: 'Spy',
  image_url: null,
}

describe('roleCard', () => {
  it('renders role name in Ukrainian', async () => {
    const wrapper = await mountSuspended(RoleCard, {
      props: { role: mockRole },
    })
    expect(wrapper.text()).toContain('Емпат')
  })

  it('renders UA description', async () => {
    const wrapper = await mountSuspended(RoleCard, {
      props: { role: mockRole },
    })
    expect(wrapper.text()).toContain('скільки ваших живих сусідів')
  })

  it('renders image when image_url is provided', async () => {
    const wrapper = await mountSuspended(RoleCard, {
      props: { role: mockRole },
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/roles/empath.webp')
  })

  it('renders fallback initial when no image', async () => {
    const wrapper = await mountSuspended(RoleCard, {
      props: { role: mockRoleNoImage },
    })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('Ш')
  })

  it('starts collapsed with aria-expanded false', async () => {
    const wrapper = await mountSuspended(RoleCard, {
      props: { role: mockRole },
    })
    const button = wrapper.find('button')
    expect(button.attributes('aria-expanded')).toBe('false')
  })

  it('expands on click showing EN content', async () => {
    const wrapper = await mountSuspended(RoleCard, {
      props: { role: mockRole },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.text()).toContain('Empath')
    expect(wrapper.text()).toContain('alive neighbours are evil')
  })

  it('collapses on second click hiding EN content', async () => {
    const wrapper = await mountSuspended(RoleCard, {
      props: { role: mockRole },
    })
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).not.toContain('alive neighbours are evil')
  })

  it('shows type and edition badges when expanded', async () => {
    const wrapper = await mountSuspended(RoleCard, {
      props: { role: mockRole },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Городяни')
    expect(wrapper.text()).toContain('Trouble Brewing')
  })

  it('renders bottom border when not last', async () => {
    const wrapper = await mountSuspended(RoleCard, {
      props: { role: mockRole, isLast: false },
    })
    expect(wrapper.find('div').classes()).toContain('border-b')
  })

  it('omits bottom border when last', async () => {
    const wrapper = await mountSuspended(RoleCard, {
      props: { role: mockRole, isLast: true },
    })
    expect(wrapper.find('div').classes()).not.toContain('border-b')
  })
})
