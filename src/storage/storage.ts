import type { AppData } from '../models/types'

const STORAGE_KEY = 'archtrening:data'

export function createEmptyData(): AppData {
  return {
    version: 1,
    tests: [],
    goals: {},
    program: null,
    history: [],
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyData()
    const parsed = JSON.parse(raw) as AppData
    return { ...createEmptyData(), ...parsed }
  } catch {
    return createEmptyData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportDataToJson(data: AppData): string {
  return JSON.stringify(data, null, 2)
}

export function importDataFromJson(json: string): AppData {
  const parsed = JSON.parse(json) as Partial<AppData>
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.tests) || !Array.isArray(parsed.history)) {
    throw new Error('Nieprawidłowy format pliku danych.')
  }
  return { ...createEmptyData(), ...parsed }
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
