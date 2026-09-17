import { getExercise } from '../data/exercises'
import { LEVEL_VOLUME_MULTIPLIER } from '../data/standards'
import { generateId } from '../storage/storage'
import type { Exercise, ExerciseSlot, FitnessLevel, FitnessTestResult, Program, WorkoutTemplate } from '../models/types'

const TOTAL_WEEKS = 8
const WORKOUTS_PER_WEEK = 3

/**
 * Picks the starting variant within a chain based on a raw test score.
 * `thresholds[i]` is the minimum score required to start at
 * `chainIdsEasyToHard[i]` (index 0's threshold is ignored — it's the floor).
 */
function pickStartingVariant(chainIdsEasyToHard: string[], thresholds: number[], rawScore: number): Exercise {
  let chosenId = chainIdsEasyToHard[0]
  for (let i = 0; i < chainIdsEasyToHard.length; i++) {
    if (rawScore >= thresholds[i]) chosenId = chainIdsEasyToHard[i]
  }
  return getExercise(chosenId)
}

function makeSlot(slotId: string, exercise: Exercise, sets: number, restSeconds: number, targetOverride?: number): ExerciseSlot {
  const slot: ExerciseSlot = { slotId, exerciseId: exercise.id, targetSets: sets, restSeconds }
  const target = targetOverride ?? exercise.baseTarget
  if (exercise.unit === 'reps') slot.targetReps = target
  else slot.targetSeconds = target
  return slot
}

// Grease-the-Groove-style volume guidance: submaximal working sets at
// roughly 40-50% of a tested max let you rack up several quality sets
// without grinding every set out near failure, which is what lets you
// actually hit 4 sets in a session instead of collapsing after set 1.
// https://fitnessvolt.com/grease-the-groove-pull-ups/
const VOLUME_FACTOR = 0.5

function workingTargetFromTest(testScore: number): number {
  return Math.max(1, Math.round(testScore * VOLUME_FACTOR))
}

// The 2-minute squat test paces reps to keep going for the full duration,
// which is a different quality than a single focused working set — there's
// no established formula to convert one into the other, so this is a
// deliberately conservative approximation rather than a cited figure.
const SQUAT_TEST_FACTOR = 0.4

// Level-scaled fallback for exercises with no direct test metric (or a
// tested movement that only loosely transfers, like side plank).
function levelScaled(baseTarget: number, level: FitnessLevel, floor = 1): number {
  return Math.max(floor, Math.round(baseTarget * LEVEL_VOLUME_MULTIPLIER[level]))
}

export function generateProgram(test: FitnessTestResult): Program {
  const pullStart = pickStartingVariant(
    ['negative-pull-up', 'pull-up', 'weighted-pull-up'],
    [0, 1, 8],
    test.pullUps,
  )
  const pushStart = pickStartingVariant(['incline-push-up', 'push-up', 'diamond-push-up'], [0, 10, 30], test.pushUps)
  const squatStart = pickStartingVariant(['squat', 'split-squat', 'jump-squat'], [0, 40, 80], test.squats2min)
  const plankStart = pickStartingVariant(['plank', 'side-plank'], [0, 60], test.plankSeconds)

  // Only scale off the raw test score when the starting variant is the
  // exact movement the test measured (regular pull-up / push-up) — for the
  // easier or harder tiers (negatives, weighted, incline, diamond) the raw
  // score doesn't transfer 1:1, so those keep their own tuned baseTarget.
  const pullTarget = pullStart.id === 'pull-up' ? workingTargetFromTest(test.pullUps) : undefined
  const pushTarget = pushStart.id === 'push-up' ? workingTargetFromTest(test.pushUps) : undefined

  // Plank and side plank are both static holds of the same tested movement
  // family, so both scale off plankSeconds — side plank additionally
  // applies the exercise library's own plank/side-plank difficulty ratio.
  const plankTarget =
    plankStart.id === 'plank'
      ? workingTargetFromTest(test.plankSeconds)
      : Math.max(5, Math.round(workingTargetFromTest(test.plankSeconds) * (getExercise('side-plank').baseTarget / getExercise('plank').baseTarget)))

  // The squat test is paced endurance, not a single fresh max effort, so
  // it gets its own more conservative conversion factor (see above).
  const squatTarget = squatStart.id === 'squat' ? Math.max(3, Math.round(test.squats2min * SQUAT_TEST_FACTOR)) : undefined

  // No fitness-test metric measures these directly — scale by overall
  // level instead so a beginner and an advanced athlete aren't handed the
  // exact same starting target.
  const scapularPull = getExercise('scapular-pull')
  const pikePushUp = getExercise('pike-push-up')
  const legRaise = getExercise('leg-raise')
  const rucking = getExercise('rucking')
  const scapularPullTarget = levelScaled(scapularPull.baseTarget, test.level)
  const pikePushUpTarget = levelScaled(pikePushUp.baseTarget, test.level)
  const legRaiseTarget = levelScaled(legRaise.baseTarget, test.level)
  const ruckingTarget = levelScaled(rucking.baseTarget, test.level, 300)

  const templateA: WorkoutTemplate = {
    letter: 'A',
    name: 'Trening A',
    slots: [
      makeSlot('A1', pullStart, 4, 90, pullTarget),
      makeSlot('A2', pushStart, 4, 60, pushTarget),
      makeSlot('A3', squatStart, 3, 60, squatTarget),
      makeSlot('A4', plankStart, 3, 45, plankTarget),
    ],
  }

  const templateB: WorkoutTemplate = {
    letter: 'B',
    name: 'Trening B',
    slots: [
      makeSlot('B1', scapularPull, 4, 90, scapularPullTarget),
      makeSlot('B2', pushStart, 3, 60, pushTarget),
      makeSlot('B3', squatStart, 3, 60, squatTarget),
      makeSlot('B4', legRaise, 3, 45, legRaiseTarget),
    ],
  }

  const templateC: WorkoutTemplate = {
    letter: 'C',
    name: 'Trening C',
    slots: [
      makeSlot('C1', pullStart, 4, 90, pullTarget),
      makeSlot('C2', pikePushUp, 3, 60, pikePushUpTarget),
      makeSlot('C3', squatStart, 3, 60, squatTarget),
      makeSlot('C4', rucking, 1, 0, ruckingTarget),
    ],
  }

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    totalWeeks: TOTAL_WEEKS,
    startingLevel: test.level,
    workoutsPerWeek: WORKOUTS_PER_WEEK,
    templates: [templateA, templateB, templateC],
    completedWorkoutIds: [],
  }
}

export function getCurrentWeek(program: Program): number {
  return Math.min(program.totalWeeks, Math.floor(program.completedWorkoutIds.length / program.workoutsPerWeek) + 1)
}

export function getNextWorkoutLetter(program: Program): 'A' | 'B' | 'C' {
  const letters: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C']
  return letters[program.completedWorkoutIds.length % program.workoutsPerWeek]
}

export function isProgramFinished(program: Program): boolean {
  return program.completedWorkoutIds.length >= program.totalWeeks * program.workoutsPerWeek
}
