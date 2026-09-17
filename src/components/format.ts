import { getExercise } from '../data/exercises'
import type { ExerciseSlot } from '../models/types'

export function formatSlotTarget(slot: ExerciseSlot): string {
  const exercise = getExercise(slot.exerciseId)
  if (exercise.unit === 'seconds') {
    return `${slot.targetSets} × ${formatSeconds(slot.targetSeconds ?? exercise.baseTarget)}`
  }
  return `${slot.targetSets} × ${slot.targetReps ?? exercise.baseTarget}`
}

export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function parseTimeToSeconds(value: string): number {
  const match = value.match(/^(\d+):(\d{1,2})$/)
  if (match) return Number(match[1]) * 60 + Number(match[2])
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
