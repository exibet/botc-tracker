export interface ScriptInfo {
  value: string
  label: string
  labelUa: string
}

export const SCRIPTS: ScriptInfo[] = [
  { value: 'trouble_brewing', label: 'Trouble Brewing', labelUa: 'Неприємності в місті' },
  { value: 'bad_moon_rising', label: 'Bad Moon Rising', labelUa: 'Схід поганого місяця' },
  { value: 'sects_and_violets', label: 'Sects & Violets', labelUa: 'Секти та Фіалки' },
  { value: 'custom', label: 'Custom', labelUa: 'Кастомний' },
]

export const WINNERS = [
  {
    value: 'good', label: 'Good', labelUa: 'Добро',
    icon: 'pi pi-sun', severity: 'success' as const,
  },
  {
    value: 'evil', label: 'Evil', labelUa: 'Зло',
    icon: 'pi pi-moon', severity: 'danger' as const,
  },
]

export function getScriptLabel(script: string): string {
  return SCRIPTS.find(s => s.value === script)?.labelUa ?? script
}

export interface GameStatusInfo {
  value: string
  labelUa: string
  icon: string
  severity: 'info' | 'warn' | 'success'
}

export const GAME_STATUSES: GameStatusInfo[] = [
  {
    value: 'upcoming', labelUa: 'Заплановано',
    icon: 'pi pi-calendar', severity: 'success',
  },
  {
    value: 'in_progress', labelUa: 'В процесі',
    icon: 'pi pi-play', severity: 'warn',
  },
  {
    value: 'finished', labelUa: 'Завершена',
    icon: 'pi pi-check-circle', severity: 'success',
  },
]

export function getWinnerInfo(winner: string | null) {
  if (!winner) return null
  return WINNERS.find(w => w.value === winner)
}

export function getGameStatusInfo(status: string) {
  return GAME_STATUSES.find(s => s.value === status)
}

export function useGameLabels() {
  return {
    scripts: SCRIPTS,
    winners: WINNERS,
    gameStatuses: GAME_STATUSES,
    getScriptLabel,
    getWinnerInfo,
    getGameStatusInfo,
  }
}
