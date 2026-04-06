import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppHeader from '~/components/layout/AppHeader.vue'

describe('appHeader', () => {
  it('renders the brand name', async () => {
    const wrapper = await mountSuspended(AppHeader)
    expect(wrapper.text()).toContain('BotC Tracker')
  })

  it('renders navigation links', async () => {
    const wrapper = await mountSuspended(AppHeader)
    const text = wrapper.text()
    expect(text).toContain('Головна')
    expect(text).toContain('Ігри')
    expect(text).toContain('Гравці')
    expect(text).toContain('Лідерборд')
    expect(text).toContain('Ролі')
  })
})
