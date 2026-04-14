import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import WinnerSelector from '~~/app/components/games/WinnerSelector.vue'

describe('WinnerSelector', () => {
  it('renders both good and evil buttons', () => {
    const wrapper = mount(WinnerSelector, { props: { modelValue: null } })
    const buttons = wrapper.findAll('[data-testid="game-winner"]')
    expect(buttons).toHaveLength(2)
    expect(wrapper.text()).toContain('Добро')
    expect(wrapper.text()).toContain('Зло')
  })

  it('emits update:modelValue with "good" on first button click', async () => {
    const wrapper = mount(WinnerSelector, { props: { modelValue: null } })
    await wrapper.findAll('[data-testid="game-winner"]')[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['good']])
  })

  it('emits update:modelValue with "evil" on second button click', async () => {
    const wrapper = mount(WinnerSelector, { props: { modelValue: null } })
    await wrapper.findAll('[data-testid="game-winner"]')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['evil']])
  })

  it('applies selected styling when modelValue matches', () => {
    const wrapper = mount(WinnerSelector, { props: { modelValue: 'good' } })
    const goodBtn = wrapper.findAll('[data-testid="game-winner"]')[0]!
    expect(goodBtn.classes()).toContain('badge-good')
  })

  it('applies sm size class when size prop is sm', () => {
    const wrapper = mount(WinnerSelector, { props: { modelValue: null, size: 'sm' } })
    const btn = wrapper.findAll('[data-testid="game-winner"]')[0]!
    expect(btn.classes()).toContain('px-4')
  })

  it('applies lg size class by default', () => {
    const wrapper = mount(WinnerSelector, { props: { modelValue: null } })
    const btn = wrapper.findAll('[data-testid="game-winner"]')[0]!
    expect(btn.classes()).toContain('px-6')
  })
})
