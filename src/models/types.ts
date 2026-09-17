// Domain model for the training progression system.

export type ExerciseUnit = 'reps' | 'seconds'

export type ExerciseCategory = 'pull' | 'push' | 'legs' | 'core' | 'cardio'

/**
 * A single exercise definition. Exercises that belong to the same
 * `variantGroup` form a progression chain ordered by `variantOrder`
 * (0 = easiest). `baseTarget` is the starting reps/seconds a user gets
 * when they first land on this variant (via generation, or by advancing
 * from the previous one). `graduationTarget` is the reps/seconds that,
 * once reached, promotes the slot to the next variant in the chain.
 */
export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  unit: ExerciseUnit
  variantGroup: string
  variantOrder: number
  baseTarget: number
  graduationTarget?: number
}

export type FitnessLevel = 'poczatkujacy' | 'podstawowy' | 'sredniozaawansowany' | 'zaawansowany'

export interface FitnessTestResult {
  id: string
  date: string // ISO date
  pushUps: number
  pullUps: number
  squats2min: number
  plankSeconds: number
  run3kmSeconds: number
  level: FitnessLevel
}

export interface Goals {
  pushUps?: number
  pullUps?: number
  squats2min?: number
  plankSeconds?: number
  run3kmSeconds?: number
}

export type DifficultyRating = 1 | 2 | 3 | 4 | 5

export type WorkoutLetter = 'A' | 'B' | 'C'

/**
 * A slot within a workout template. `exerciseId` is mutable over time:
 * the progression algorithm swaps it for the next/previous variant in
 * the exercise's chain as the user advances or regresses.
 */
export interface ExerciseSlot {
  slotId: string
  exerciseId: string
  targetSets: number
  targetReps?: number
  targetSeconds?: number
  restSeconds: number
}

export interface WorkoutTemplate {
  letter: WorkoutLetter
  name: string
  slots: ExerciseSlot[]
}

export interface Program {
  id: string
  createdAt: string // ISO date
  totalWeeks: number
  startingLevel: FitnessLevel
  workoutsPerWeek: number
  templates: WorkoutTemplate[]
  completedWorkoutIds: string[]
}

export interface ExerciseLogEntry {
  slotId: string
  exerciseId: string
  targetSets: number
  targetReps?: number
  targetSeconds?: number
  actualReps?: number[]
  actualSeconds?: number[]
}

export interface WorkoutLog {
  id: string
  date: string // ISO date
  templateLetter: WorkoutLetter
  weekNumber: number
  entries: ExerciseLogEntry[]
  difficulty: DifficultyRating
  completed: boolean
}

export type Sex = 'M' | 'K'

export type ActivityLevel = 'siedzacy' | 'lekka' | 'umiarkowana' | 'wysoka' | 'bardzo-wysoka'

export interface UserProfile {
  weightKg: number
  heightCm: number
  age: number
  sex: Sex
  activityLevel: ActivityLevel
}

export interface AppData {
  version: 1
  tests: FitnessTestResult[]
  goals: Goals
  program: Program | null
  history: WorkoutLog[]
  profile?: UserProfile
}
