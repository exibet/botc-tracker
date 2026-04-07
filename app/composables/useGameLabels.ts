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

export function getWinnerInfo(winner: string) {
  return WINNERS.find(w => w.value === winner)
}

export function useGameLabels() {
  return {
    scripts: SCRIPTS,
    winners: WINNERS,
    getScriptLabel,
    getWinnerInfo,
  }
}
