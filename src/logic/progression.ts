import { getExercise, getNextVariant, getPrevVariant } from '../data/exercises'
import type { DifficultyRating, ExerciseLogEntry, ExerciseSlot, Program, WorkoutLetter } from '../models/types'

// Core progression algorithm. Pure functions only — no React, no storage —
// so this can be unit tested in isolation and tuned independently of the UI.
//
// Rules, given a slot's target and the actual reps/seconds performed per set:
//
// 1. If every set met or exceeded the target:
//    - very easy (1)  -> +2
//    - easy (2)       -> +1
//    - appropriate (3)-> +1  (still progressive overload, just no bonus)
//    - hard (4)       -> repeat the same target (consolidate)
//    - very hard (5)  -> repeat the same target
//    If the new target would reach the exercise's graduation threshold and
//    a harder variant exists, advance to it and reset to its base target.
//
// 2. If at least one set fell short of the target:
//    - very hard (5), or the shortfall is large (>=30% of the target total)
//      -> regress: drop 20% (floor at the variant's base target), and if
//         already at the base target, fall back to the previous variant
//         if one exists.
//    - anything else -> repeat the same target unchanged.

const INCREMENTS: Record<DifficultyRating, number> = { 1: 2, 2: 1, 3: 1, 4: 0, 5: 0 }
const LARGE_SHORTFALL_RATIO = 0.3
const REGRESSION_FACTOR = 0.8

function metAllSets(target: number, sets: number, actual: number[]): boolean {
  return actual.length >= sets && actual.every((v) => v >= target)
}

function shortfallRatio(target: number, sets: number, actual: number[]): number {
  const totalTarget = target * sets
  if (totalTarget <= 0) return 0
  const totalActual = actual.reduce((a, b) => a + Math.min(b, target), 0)
  return Math.max(0, (totalTarget - totalActual) / totalTarget)
}

export interface ProgressionResult {
  slot: ExerciseSlot
  variantChanged: 'advanced' | 'regressed' | null
}

export function computeNextSlot(slot: ExerciseSlot, actual: number[], difficulty: DifficultyRating): ProgressionResult {
  const exercise = getExercise(slot.exerciseId)
  const isTime = exercise.unit === 'seconds'
  const target = (isTime ? slot.targetSeconds : slot.targetReps) ?? exercise.baseTarget
  const sets = slot.targetSets
  const values = actual

  const met = metAllSets(target, sets, values)

  if (met) {
    const increment = INCREMENTS[difficulty] * (exercise.stepSize ?? 1)
    const newTarget = target + increment
    const graduation = exercise.graduationTarget
    if (graduation !== undefined && newTarget >= graduation) {
      const next = getNextVariant(exercise.id)
      if (next) {
        const slotOut: ExerciseSlot = { ...slot, exerciseId: next.id }
        if (isTime) slotOut.targetSeconds = next.baseTarget
        else slotOut.targetReps = next.baseTarget
        return { slot: slotOut, variantChanged: 'advanced' }
      }
    }
    const slotOut: ExerciseSlot = { ...slot }
    if (isTime) slotOut.targetSeconds = newTarget
    else slotOut.targetReps = newTarget
    return { slot: slotOut, variantChanged: null }
  }

  const ratio = shortfallRatio(target, sets, values)
  const shouldRegress = difficulty === 5 || ratio >= LARGE_SHORTFALL_RATIO

  if (!shouldRegress) {
    return { slot: { ...slot }, variantChanged: null }
  }

  const reduced = Math.max(exercise.baseTarget, Math.round(target * REGRESSION_FACTOR))
  if (reduced < target) {
    const slotOut: ExerciseSlot = { ...slot }
    if (isTime) slotOut.targetSeconds = reduced
    else slotOut.targetReps = reduced
    return { slot: slotOut, variantChanged: null }
  }

  // Already at (or below) the base target for this variant — fall back a level.
  const prev = getPrevVariant(exercise.id)
  if (prev) {
    const slotOut: ExerciseSlot = { ...slot, exerciseId: prev.id }
    if (isTime) slotOut.targetSeconds = prev.baseTarget
    else slotOut.targetReps = prev.baseTarget
    return { slot: slotOut, variantChanged: 'regressed' }
  }

  return { slot: { ...slot }, variantChanged: null }
}

/**
 * Applies the outcome of a completed workout to the program: recomputes
 * the target for every slot in the matching template based on what was
 * actually performed and the reported difficulty, and marks the workout
 * as completed. Returns a new Program (does not mutate the input).
 */
export function applyWorkoutToProgram(program: Program, workoutId: string, templateLetter: WorkoutLetter, entries: ExerciseLogEntry[], difficulty: DifficultyRating): Program {
  const templates = program.templates.map((template) => {
    if (template.letter !== templateLetter) return template
    const slots = template.slots.map((slot) => {
      const entry = entries.find((e) => e.slotId === slot.slotId)
      if (!entry) return slot
      const exercise = getExercise(slot.exerciseId)
      const actual = (exercise.unit === 'seconds' ? entry.actualSeconds : entry.actualReps) ?? []
      return computeNextSlot(slot, actual, difficulty).slot
    })
    return { ...template, slots }
  })

  return {
    ...program,
    templates,
    completedWorkoutIds: [...program.completedWorkoutIds, workoutId],
  }
}
