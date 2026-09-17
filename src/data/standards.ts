import type { FitnessLevel, FitnessTestResult } from '../models/types'

// Threshold configuration used to translate a fitness test into a level.
// These numbers are loosely inspired by publicly known bodyweight fitness
// benchmarks and general military-style conditioning standards, adapted
// for a general audience. They are NOT an official standard of any
// military or institution, and are intentionally kept in this single,
// easily editable module.

interface MetricThresholds {
  podstawowy: number
  sredniozaawansowany: number
  zaawansowany: number
}

// For run time (seconds), lower is better, so thresholds are MAXIMUM
// seconds allowed for a given level (i.e. finishing at or below unlocks it).
export const STANDARDS = {
  pushUps: { podstawowy: 15, sredniozaawansowany: 30, zaawansowany: 45 } satisfies MetricThresholds,
  pullUps: { podstawowy: 3, sredniozaawansowany: 8, zaawansowany: 14 } satisfies MetricThresholds,
  squats2min: { podstawowy: 40, sredniozaawansowany: 60, zaawansowany: 80 } satisfies MetricThresholds,
  plankSeconds: { podstawowy: 45, sredniozaawansowany: 90, zaawansowany: 150 } satisfies MetricThresholds,
  run3kmSeconds: { podstawowy: 1080, sredniozaawansowany: 900, zaawansowany: 750 } satisfies MetricThresholds, // 18:00 / 15:00 / 12:30
}

const LEVEL_ORDER: FitnessLevel[] = ['poczatkujacy', 'podstawowy', 'sredniozaawansowany', 'zaawansowany']

function scoreHigherIsBetter(value: number, t: MetricThresholds): number {
  if (value >= t.zaawansowany) return 3
  if (value >= t.sredniozaawansowany) return 2
  if (value >= t.podstawowy) return 1
  return 0
}

function scoreLowerIsBetter(value: number, t: MetricThresholds): number {
  if (value <= t.zaawansowany) return 3
  if (value <= t.sredniozaawansowany) return 2
  if (value <= t.podstawowy) return 1
  return 0
}

export function evaluateLevel(test: Pick<FitnessTestResult, 'pushUps' | 'pullUps' | 'squats2min' | 'plankSeconds' | 'run3kmSeconds'>): FitnessLevel {
  const scores = [
    scoreHigherIsBetter(test.pushUps, STANDARDS.pushUps),
    scoreHigherIsBetter(test.pullUps, STANDARDS.pullUps),
    scoreHigherIsBetter(test.squats2min, STANDARDS.squats2min),
    scoreHigherIsBetter(test.plankSeconds, STANDARDS.plankSeconds),
    scoreLowerIsBetter(test.run3kmSeconds, STANDARDS.run3kmSeconds),
  ]
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const index = Math.round(avg)
  return LEVEL_ORDER[index]
}

export const LEVEL_LABELS: Record<FitnessLevel, string> = {
  poczatkujacy: 'Początkujący',
  podstawowy: 'Podstawowy',
  sredniozaawansowany: 'Średniozaawansowany',
  zaawansowany: 'Zaawansowany',
}
