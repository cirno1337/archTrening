import { describe, expect, it } from 'vitest'
import { generateProgram, getCurrentWeek, getNextWorkoutLetter } from './planGenerator'
import { evaluateLevel } from '../data/standards'
import type { FitnessTestResult } from '../models/types'

function makeTest(overrides: Partial<FitnessTestResult> = {}): FitnessTestResult {
  const base = {
    pushUps: 20,
    pullUps: 2,
    squats2min: 54,
    plankSeconds: 70,
    run3kmSeconds: 942,
    ...overrides,
  }
  return { id: 't1', date: new Date().toISOString(), level: evaluateLevel(base), ...base }
}

describe('generateProgram', () => {
  it('generates an 8-week, 3-workout-per-week program with three templates', () => {
    const program = generateProgram(makeTest())
    expect(program.totalWeeks).toBe(8)
    expect(program.workoutsPerWeek).toBe(3)
    expect(program.templates.map((t) => t.letter)).toEqual(['A', 'B', 'C'])
    expect(program.completedWorkoutIds).toEqual([])
  })

  it('starts a complete beginner on the easiest variants', () => {
    const program = generateProgram(makeTest({ pullUps: 0, pushUps: 3, squats2min: 10, plankSeconds: 15 }))
    const templateA = program.templates.find((t) => t.letter === 'A')!
    expect(templateA.slots[0].exerciseId).toBe('negative-pull-up')
    expect(templateA.slots[1].exerciseId).toBe('incline-push-up')
    expect(templateA.slots[2].exerciseId).toBe('squat')
  })

  it('starts a strong athlete on harder variants', () => {
    const program = generateProgram(makeTest({ pullUps: 10, pushUps: 40, squats2min: 90, plankSeconds: 80 }))
    const templateA = program.templates.find((t) => t.letter === 'A')!
    expect(templateA.slots[0].exerciseId).toBe('weighted-pull-up')
    expect(templateA.slots[1].exerciseId).toBe('diamond-push-up')
    expect(templateA.slots[2].exerciseId).toBe('jump-squat')
  })

  it('only uses exercises that need a pull-up bar, plates, or nothing at all', () => {
    // No low bar/rings (inverted row) and no bodyweight-only conditioning
    // (burpee) — the program should fit a pull-up bar + up to 3x10kg plates.
    const program = generateProgram(makeTest())
    const templateB = program.templates.find((t) => t.letter === 'B')!
    const templateC = program.templates.find((t) => t.letter === 'C')!
    expect(templateB.slots[0].exerciseId).toBe('scapular-pull')
    expect(templateC.slots[3].exerciseId).toBe('rucking')
  })
})

describe('getCurrentWeek / getNextWorkoutLetter', () => {
  it('rotates through A, B, C and advances the week every 3 workouts', () => {
    const program = generateProgram(makeTest())
    expect(getNextWorkoutLetter(program)).toBe('A')
    expect(getCurrentWeek(program)).toBe(1)

    program.completedWorkoutIds.push('w1')
    expect(getNextWorkoutLetter(program)).toBe('B')

    program.completedWorkoutIds.push('w2', 'w3')
    expect(getNextWorkoutLetter(program)).toBe('A')
    expect(getCurrentWeek(program)).toBe(2)
  })
})
