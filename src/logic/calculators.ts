import type { ActivityLevel, UserProfile } from '../models/types'

// Pure calculation helpers — no React, no storage — so they stay easy to
// unit test and tune independently of the UI.

export type BmiCategory = 'niedowaga' | 'prawidlowa' | 'nadwaga' | 'otylosc'

export const BMI_CATEGORY_LABELS: Record<BmiCategory, string> = {
  niedowaga: 'Niedowaga',
  prawidlowa: 'Waga prawidłowa',
  nadwaga: 'Nadwaga',
  otylosc: 'Otyłość',
}

export function computeBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  if (heightM <= 0) return 0
  return weightKg / (heightM * heightM)
}

export function classifyBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'niedowaga'
  if (bmi < 25) return 'prawidlowa'
  if (bmi < 30) return 'nadwaga'
  return 'otylosc'
}

// Activity multipliers applied to BMR to estimate total daily energy
// expenditure (TDEE). Kept here as a single editable config.
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  siedzacy: 1.2,
  lekka: 1.375,
  umiarkowana: 1.55,
  wysoka: 1.725,
  'bardzo-wysoka': 1.9,
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  siedzacy: 'Siedzący (brak / mało ruchu)',
  lekka: 'Lekka (1-3x trening/tydz.)',
  umiarkowana: 'Umiarkowana (3-5x trening/tydz.)',
  wysoka: 'Wysoka (6-7x trening/tydz.)',
  'bardzo-wysoka': 'Bardzo wysoka (trening + praca fizyczna)',
}

// Mifflin-St Jeor equation.
export function computeBmr(profile: Pick<UserProfile, 'weightKg' | 'heightCm' | 'age' | 'sex'>): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age
  return profile.sex === 'M' ? base + 5 : base - 161
}

export function computeTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel]
}

export interface CalorieTargets {
  bmr: number
  maintenance: number
  cutting: number
  bulking: number
}

export function computeCalorieTargets(profile: UserProfile): CalorieTargets {
  const bmr = computeBmr(profile)
  const maintenance = computeTdee(bmr, profile.activityLevel)
  return {
    bmr,
    maintenance,
    cutting: maintenance - 500,
    bulking: maintenance + 300,
  }
}
