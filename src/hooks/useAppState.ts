import { useCallback, useEffect, useState } from 'react'
import { evaluateLevel } from '../data/standards'
import { applyWorkoutToProgram } from '../logic/progression'
import { generateProgram } from '../logic/planGenerator'
import { exportDataToJson, generateId, importDataFromJson, loadData, saveData } from '../storage/storage'
import type { AppData, DifficultyRating, ExerciseLogEntry, FitnessTestResult, Goals, UserProfile, WorkoutLetter } from '../models/types'

export function useAppState() {
  const [data, setData] = useState<AppData>(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  const saveTestResult = useCallback((result: Omit<FitnessTestResult, 'id' | 'level'>) => {
    const level = evaluateLevel(result)
    const test: FitnessTestResult = { ...result, id: generateId(), level }
    setData((prev) => ({ ...prev, tests: [...prev.tests, test] }))
    return test
  }, [])

  const setGoals = useCallback((goals: Goals) => {
    setData((prev) => ({ ...prev, goals }))
  }, [])

  const startNewProgram = useCallback((test: FitnessTestResult) => {
    setData((prev) => ({ ...prev, program: generateProgram(test) }))
  }, [])

  const completeWorkout = useCallback(
    (templateLetter: WorkoutLetter, weekNumber: number, entries: ExerciseLogEntry[], difficulty: DifficultyRating) => {
      setData((prev) => {
        if (!prev.program) return prev
        const workoutId = generateId()
        const program = applyWorkoutToProgram(prev.program, workoutId, templateLetter, entries, difficulty)
        const log = {
          id: workoutId,
          date: new Date().toISOString(),
          templateLetter,
          weekNumber,
          entries,
          difficulty,
          completed: true,
        }
        return { ...prev, program, history: [...prev.history, log] }
      })
    },
    [],
  )

  const setProfile = useCallback((profile: UserProfile) => {
    setData((prev) => ({ ...prev, profile }))
  }, [])

  const resetProgram = useCallback(() => {
    setData((prev) => ({ ...prev, program: null }))
  }, [])

  const exportJson = useCallback(() => exportDataToJson(data), [data])

  const importJson = useCallback((json: string) => {
    const imported = importDataFromJson(json)
    setData(imported)
  }, [])

  return {
    data,
    saveTestResult,
    setGoals,
    setProfile,
    startNewProgram,
    completeWorkout,
    resetProgram,
    exportJson,
    importJson,
  }
}
