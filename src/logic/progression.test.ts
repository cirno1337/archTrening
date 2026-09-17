import { describe, expect, it } from 'vitest'
import { computeNextSlot } from './progression'
import type { ExerciseSlot } from '../models/types'

function pushUpSlot(reps: number, sets = 4): ExerciseSlot {
  return { slotId: 'A2', exerciseId: 'push-up', targetSets: sets, targetReps: reps, restSeconds: 60 }
}

describe('computeNextSlot', () => {
  it('increases the target after an easy workout where all sets were completed', () => {
    const slot = pushUpSlot(10)
    const result = computeNextSlot(slot, [10, 10, 10, 10], 2)
    expect(result.slot.targetReps).toBe(11)
    expect(result.variantChanged).toBeNull()
  })

  it('keeps the same target after a normal workout that was slightly missed', () => {
    const slot = pushUpSlot(10)
    const result = computeNextSlot(slot, [10, 10, 9, 8], 4)
    expect(result.slot.targetReps).toBe(10)
    expect(result.variantChanged).toBeNull()
  })

  it('reduces the target after a very hard workout that could not be completed', () => {
    const slot = pushUpSlot(10)
    const result = computeNextSlot(slot, [6, 5, 5, 4], 5)
    expect(result.slot.targetReps).toBeLessThan(10)
  })

  it('regresses to the previous variant when already at the base target and still failing', () => {
    // push-up base target is 8
    const slot = pushUpSlot(8)
    const result = computeNextSlot(slot, [4, 3, 3, 2], 5)
    expect(result.variantChanged).toBe('regressed')
    expect(result.slot.exerciseId).toBe('incline-push-up')
  })

  it('advances to the next variant once the graduation target is reached', () => {
    // push-up graduates at 25 reps
    const slot = pushUpSlot(24)
    const result = computeNextSlot(slot, [24, 24, 24, 24], 2)
    expect(result.variantChanged).toBe('advanced')
    expect(result.slot.exerciseId).toBe('diamond-push-up')
  })

  it('progresses time-based exercises in seconds', () => {
    const slot: ExerciseSlot = { slotId: 'A4', exerciseId: 'plank', targetSets: 3, targetSeconds: 30, restSeconds: 45 }
    const result = computeNextSlot(slot, [30, 30, 30], 1)
    expect(result.slot.targetSeconds).toBe(32)
  })
})
