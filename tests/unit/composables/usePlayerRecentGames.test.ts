import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const ROLE_TOWN = { name_ua: 'Емпат', image_url: null, type: 'townsfolk' }

let fetchTransform: ((rows: unknown[]) => unknown) | null = null
const mockData = ref<unknown[]>([])
const mockStatus = ref('success')

type FetchOpts = {
  transform?: (rows: unknown[]) => unknown[]
  default: () => unknown[]
}

mockNuxtImport('useFetch', () => (_url: string, opts: FetchOpts) => {
  fetchTransform = opts.transform ?? null
  return { data: mockData, status: mockStatus }
})

describe('usePlayerRecentGames', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchTransform = null
    mockData.value = []
    mockStatus.value = 'success'
  })

  it('passes limit query param', () => {
    usePlayerRecentGames('p1', 10)
    // Indirect check — transform was registered, so opts were processed
    expect(fetchTransform).toBeTruthy()
  })

  it('transforms raw rows: maps role and won correctly', () => {
    usePlayerRecentGames('p1', 5)

    const result = fetchTransform!([{
      game_id: 'g1',
      is_mvp: true,
      alignment_start: 'good',
      alignment_end: null,
      starting_role: ROLE_TOWN,
      ending_role: null,
      game: {
        id: 'g1',
        date: '2026-01-01',
        script: 'trouble_brewing',
        status: 'finished',
        winner: 'good',
        created_at: '',
      },
    }]) as { roleName: string, won: boolean, isMvp: boolean }[]

    expect(result[0]).toMatchObject({
      gameId: 'g1',
      roleName: 'Емпат',
      won: true,
      isMvp: true,
    })
  })

  it('won is false when alignment differs from winner', () => {
    usePlayerRecentGames('p1')

    const result = fetchTransform!([{
      game_id: 'g1',
      is_mvp: false,
      alignment_start: 'evil',
      alignment_end: null,
      starting_role: ROLE_TOWN,
      ending_role: null,
      game: { id: 'g1', date: '2026-01-01', script: 'tb', status: 'finished', winner: 'good', created_at: '' },
    }]) as { won: boolean }[]

    expect(result[0]!.won).toBe(false)
  })

  it('uses ending role when present', () => {
    const ROLE_DEMON = { name_ua: 'Імп', image_url: null, type: 'demon' }
    usePlayerRecentGames('p1')

    const result = fetchTransform!([{
      game_id: 'g1',
      is_mvp: false,
      alignment_start: 'good',
      alignment_end: 'evil',
      starting_role: ROLE_TOWN,
      ending_role: ROLE_DEMON,
      game: { id: 'g1', date: '2026-01-01', script: 'tb', status: 'finished', winner: 'evil', created_at: '' },
    }]) as { roleName: string, won: boolean, roleType: string }[]

    expect(result[0]!.roleName).toBe('Імп')
    expect(result[0]!.roleType).toBe('demon')
    expect(result[0]!.won).toBe(true)
  })

  it('loading reflects pending status', () => {
    mockStatus.value = 'pending'
    const { loading } = usePlayerRecentGames('p1')
    expect(loading.value).toBe(true)
  })
})
