import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import GameForm from '~/components/games/GameForm.vue'

describe('GameForm — submit logic', () => {
  it('emits submit with formatted date (YYYY-MM-DD)', async () => {
    const wrapper = await mountSuspended(GameForm, {
      props: {
        initialData: {
          date: '2026-05-15',
          script: 'trouble_brewing',
          custom_script_name: null,
          winner: null,
          storyteller_id: null,
          notes: null,
        },
        players: [],
      },
    })

    await wrapper.find('[data-testid="game-form"]').trigger('submit.prevent')

    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    expect(emitted![0]![0]).toMatchObject({
      date: '2026-05-15',
      script: 'trouble_brewing',
    })
  })

  it('nullifies custom_script_name when script is not "custom"', async () => {
    const wrapper = await mountSuspended(GameForm, {
      props: {
        initialData: {
          date: '2026-01-01',
          script: 'trouble_brewing',
          custom_script_name: 'leftover-name',
          winner: null,
          storyteller_id: null,
          notes: null,
        },
        players: [],
      },
    })

    await wrapper.find('[data-testid="game-form"]').trigger('submit.prevent')
    expect(wrapper.emitted('submit')![0]![0]).toMatchObject({
      custom_script_name: null,
    })
  })

  it('preserves custom_script_name when script is "custom"', async () => {
    const wrapper = await mountSuspended(GameForm, {
      props: {
        initialData: {
          date: '2026-01-01',
          script: 'custom',
          custom_script_name: 'My Script',
          winner: null,
          storyteller_id: null,
          notes: null,
        },
        players: [],
      },
    })

    await wrapper.find('[data-testid="game-form"]').trigger('submit.prevent')
    expect(wrapper.emitted('submit')![0]![0]).toMatchObject({
      custom_script_name: 'My Script',
    })
  })

  it('converts empty strings to null on submit', async () => {
    const wrapper = await mountSuspended(GameForm, {
      props: {
        initialData: {
          date: '2026-01-01',
          script: 'trouble_brewing',
          custom_script_name: null,
          winner: null,
          storyteller_id: null,
          notes: '',
        },
        players: [],
      },
    })

    await wrapper.find('[data-testid="game-form"]').trigger('submit.prevent')
    expect(wrapper.emitted('submit')![0]![0]).toMatchObject({
      notes: null,
      winner: null,
    })
  })
})
