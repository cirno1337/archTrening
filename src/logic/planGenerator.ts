import { getExercise } from '../data/exercises'
import { generateId } from '../storage/storage'
import type { Exercise, ExerciseSlot, FitnessTestResult, Program, WorkoutTemplate } from '../models/types'

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

function makeSlot(slotId: string, exercise: Exercise, sets: number, restSeconds: number): ExerciseSlot {
  const slot: ExerciseSlot = { slotId, exerciseId: exercise.id, targetSets: sets, restSeconds }
  if (exercise.unit === 'reps') slot.targetReps = exercise.baseTarget
  else slot.targetSeconds = exercise.baseTarget
  return slot
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

  const templateA: WorkoutTemplate = {
    letter: 'A',
    name: 'Trening A',
    slots: [
      makeSlot('A1', pullStart, 4, 90),
      makeSlot('A2', pushStart, 4, 60),
      makeSlot('A3', squatStart, 3, 60),
      makeSlot('A4', plankStart, 3, 45),
    ],
  }

  const templateB: WorkoutTemplate = {
    letter: 'B',
    name: 'Trening B',
    slots: [
      makeSlot('B1', getExercise('scapular-pull'), 4, 90),
      makeSlot('B2', pushStart, 3, 60),
      makeSlot('B3', squatStart, 3, 60),
      makeSlot('B4', getExercise('leg-raise'), 3, 45),
    ],
  }

  const templateC: WorkoutTemplate = {
    letter: 'C',
    name: 'Trening C',
    slots: [
      makeSlot('C1', pullStart, 4, 90),
      makeSlot('C2', getExercise('pike-push-up'), 3, 60),
      makeSlot('C3', squatStart, 3, 60),
      makeSlot('C4', getExercise('rucking'), 1, 0),
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
