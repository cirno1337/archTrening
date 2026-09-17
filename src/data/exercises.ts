import type { Exercise } from '../models/types'

// Independent training-progression project. Not affiliated with, and not
// an official tool of, any military organization. Exercise selection is
// inspired by common bodyweight-strength progressions used in general
// fitness and military-style conditioning programs, kept intentionally
// small so it is easy to extend later.

export const EXERCISE_LIBRARY: Exercise[] = [
  // Pull chain
  { id: 'negative-pull-up', name: 'Negative pull-up', category: 'pull', unit: 'reps', variantGroup: 'pull', variantOrder: 0, baseTarget: 3, graduationTarget: 8 },
  { id: 'assisted-pull-up', name: 'Assisted pull-up', category: 'pull', unit: 'reps', variantGroup: 'pull', variantOrder: 1, baseTarget: 4, graduationTarget: 10 },
  { id: 'pull-up', name: 'Pull-up', category: 'pull', unit: 'reps', variantGroup: 'pull', variantOrder: 2, baseTarget: 3, graduationTarget: 10 },
  { id: 'weighted-pull-up', name: 'Weighted pull-up', category: 'pull', unit: 'reps', variantGroup: 'pull', variantOrder: 3, baseTarget: 3 },

  // Row (standalone back exercise, no chain)
  { id: 'inverted-row', name: 'Inverted row', category: 'pull', unit: 'reps', variantGroup: 'row', variantOrder: 0, baseTarget: 6, graduationTarget: 15 },

  // Push chain
  { id: 'incline-push-up', name: 'Incline push-up', category: 'push', unit: 'reps', variantGroup: 'push', variantOrder: 0, baseTarget: 8, graduationTarget: 20 },
  { id: 'push-up', name: 'Push-up', category: 'push', unit: 'reps', variantGroup: 'push', variantOrder: 1, baseTarget: 8, graduationTarget: 25 },
  { id: 'diamond-push-up', name: 'Diamond push-up', category: 'push', unit: 'reps', variantGroup: 'push', variantOrder: 2, baseTarget: 6 },

  // Shoulders / secondary push (standalone)
  { id: 'pike-push-up', name: 'Pike push-up', category: 'push', unit: 'reps', variantGroup: 'pike', variantOrder: 0, baseTarget: 6, graduationTarget: 15 },

  // Squat chain
  { id: 'squat', name: 'Przysiad', category: 'legs', unit: 'reps', variantGroup: 'squat', variantOrder: 0, baseTarget: 15, graduationTarget: 30 },
  { id: 'split-squat', name: 'Split squat', category: 'legs', unit: 'reps', variantGroup: 'squat', variantOrder: 1, baseTarget: 10, graduationTarget: 20 },
  { id: 'jump-squat', name: 'Jump squat', category: 'legs', unit: 'reps', variantGroup: 'squat', variantOrder: 2, baseTarget: 8 },

  // Core: plank chain (time based)
  { id: 'plank', name: 'Plank', category: 'core', unit: 'seconds', variantGroup: 'plank', variantOrder: 0, baseTarget: 30, graduationTarget: 90 },
  { id: 'side-plank', name: 'Side plank', category: 'core', unit: 'seconds', variantGroup: 'plank', variantOrder: 1, baseTarget: 20, graduationTarget: 60 },

  // Core: standalone
  { id: 'leg-raise', name: 'Leg raise', category: 'core', unit: 'reps', variantGroup: 'leg-raise', variantOrder: 0, baseTarget: 10, graduationTarget: 25 },

  // Conditioning (standalone)
  { id: 'burpee', name: 'Burpee', category: 'cardio', unit: 'reps', variantGroup: 'burpee', variantOrder: 0, baseTarget: 8, graduationTarget: 20 },
]

export function getExercise(id: string): Exercise {
  const exercise = EXERCISE_LIBRARY.find((e) => e.id === id)
  if (!exercise) throw new Error(`Unknown exercise: ${id}`)
  return exercise
}

export function getNextVariant(id: string): Exercise | undefined {
  const current = getExercise(id)
  return EXERCISE_LIBRARY.find(
    (e) => e.variantGroup === current.variantGroup && e.variantOrder === current.variantOrder + 1,
  )
}

export function getPrevVariant(id: string): Exercise | undefined {
  const current = getExercise(id)
  return EXERCISE_LIBRARY.find(
    (e) => e.variantGroup === current.variantGroup && e.variantOrder === current.variantOrder - 1,
  )
}
