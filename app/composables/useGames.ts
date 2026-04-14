import type { GameWithDetails, PaginatedResponse } from '#shared/types'
import { API } from '#shared/api'
import { FETCH_KEY } from '#shared/fetch-keys'

const PAGE_SIZE = 50

export function useGames() {
  const allGames = useState<GameWithDetails[]>(FETCH_KEY.GAMES, () => [])
  const total = useState<number>(`${FETCH_KEY.GAMES}-total`, () => 0)
  const currentPage = ref(1)
  const loadingMore = ref(false)

  function fetchPage(page: number) {
    return $fetch<PaginatedResponse<GameWithDetails>>(
      API.GAMES,
      { params: { page, limit: PAGE_SIZE } },
    )
  }

  const { status } = useAsyncData(
    FETCH_KEY.GAMES,
    async () => {
      const res = await fetchPage(1)
      allGames.value = [...res.data]
      total.value = res.total
      currentPage.value = 1
      return res
    },
  )

  const hasMore = computed(() => allGames.value.length < total.value)

  async function loadMore() {
    if (!hasMore.value || loadingMore.value) return
    loadingMore.value = true
    try {
      const nextPage = currentPage.value + 1
      const res = await fetchPage(nextPage)
      allGames.value = [...allGames.value, ...res.data]
      total.value = res.total
      currentPage.value = nextPage
    }
    finally {
      loadingMore.value = false
    }
  }

  async function refresh() {
    const res = await fetchPage(1)
    allGames.value = [...res.data]
    total.value = res.total
    currentPage.value = 1
  }

  return {
    games: allGames,
    total,
    hasMore,
    loadingMore,
    status,
    loadMore,
    refresh,
  }
}
