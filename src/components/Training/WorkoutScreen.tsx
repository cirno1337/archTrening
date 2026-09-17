import { useState } from 'react'
import { getExercise } from '../../data/exercises'
import { formatSeconds, formatSlotTarget } from '../format'
import { RestTimer } from './RestTimer'
import type { DifficultyRating, ExerciseLogEntry, WorkoutTemplate } from '../../models/types'

interface Props {
  template: WorkoutTemplate
  onComplete: (entries: ExerciseLogEntry[], difficulty: DifficultyRating) => void
  onCancel: () => void
}

const DIFFICULTY_OPTIONS: Array<{ value: DifficultyRating; label: string }> = [
  { value: 1, label: 'Bardzo łatwy' },
  { value: 2, label: 'Łatwy' },
  { value: 3, label: 'Odpowiedni' },
  { value: 4, label: 'Trudny' },
  { value: 5, label: 'Bardzo trudny' },
]

export function WorkoutScreen({ template, onComplete, onCancel }: Props) {
  const [slotIndex, setSlotIndex] = useState(0)
  const [setIndex, setSetIndex] = useState(0)
  const [counter, setCounter] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0)
  const [stopwatchHandle, setStopwatchHandle] = useState<number | null>(null)
  const [entries, setEntries] = useState<ExerciseLogEntry[]>(() =>
    template.slots.map((slot) => ({
      slotId: slot.slotId,
      exerciseId: slot.exerciseId,
      targetSets: slot.targetSets,
      targetReps: slot.targetReps,
      targetSeconds: slot.targetSeconds,
      actualReps: slot.targetReps !== undefined ? [] : undefined,
      actualSeconds: slot.targetSeconds !== undefined ? [] : undefined,
    })),
  )
  const [difficulty, setDifficulty] = useState<DifficultyRating | null>(null)
  const [finished, setFinished] = useState(false)

  const slot = template.slots[slotIndex]
  const exercise = slot ? getExercise(slot.exerciseId) : null
  const isTime = exercise?.unit === 'seconds'

  function toggleStopwatch() {
    if (stopwatchRunning) {
      if (stopwatchHandle) window.clearInterval(stopwatchHandle)
      setStopwatchRunning(false)
      return
    }
    setStopwatchRunning(true)
    const handle = window.setInterval(() => {
      setStopwatchSeconds((prev) => prev + 1)
    }, 1000)
    setStopwatchHandle(handle)
  }

  function commitSet() {
    const value = isTime ? stopwatchSeconds : counter
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== slotIndex) return entry
        if (isTime) return { ...entry, actualSeconds: [...(entry.actualSeconds ?? []), value] }
        return { ...entry, actualReps: [...(entry.actualReps ?? []), value] }
      }),
    )

    if (stopwatchHandle) window.clearInterval(stopwatchHandle)
    setStopwatchRunning(false)
    setStopwatchSeconds(0)
    setCounter(0)

    const nextSetIndex = setIndex + 1
    if (nextSetIndex >= slot.targetSets) {
      const nextSlotIndex = slotIndex + 1
      if (nextSlotIndex >= template.slots.length) {
        setFinished(true)
      } else {
        setSlotIndex(nextSlotIndex)
        setSetIndex(0)
      }
    } else {
      setSetIndex(nextSetIndex)
    }
  }

  if (finished) {
    return (
      <div className="main">
        <div className="page-title">{template.name.toUpperCase()}</div>
        <h1 className="page-heading">Jak trudny był trening?</h1>
        <div className="panel">
          <div className="difficulty-picker">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`difficulty-picker__option ${difficulty === opt.value ? 'difficulty-picker__option--selected' : ''}`}
                onClick={() => setDifficulty(opt.value)}
              >
                {opt.value}
                <br />
                {opt.label}
              </button>
            ))}
          </div>
          <button className="btn btn--primary" disabled={difficulty === null} onClick={() => difficulty && onComplete(entries, difficulty)}>
            Zakończ trening
          </button>
        </div>
      </div>
    )
  }

  if (!slot || !exercise) return null

  const doneSetsForSlot = entries[slotIndex]?.actualReps?.length ?? entries[slotIndex]?.actualSeconds?.length ?? 0

  return (
    <div className="main">
      <div className="page-title">{template.name.toUpperCase()}</div>
      <h1 className="page-heading">
        {slotIndex + 1} / {template.slots.length}
      </h1>

      <div className="panel">
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>{exercise.name.toUpperCase()}</h2>
        <p className="muted" style={{ fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
          {formatSlotTarget(slot)} · seria {setIndex + 1} / {slot.targetSets}
        </p>

        <div className="set-tracker">
          {Array.from({ length: slot.targetSets }).map((_, i) => (
            <div key={i} className={`set-box ${i < doneSetsForSlot ? 'set-box--done' : ''}`}>
              {i < doneSetsForSlot ? '✓' : i === setIndex ? (isTime ? formatSeconds(stopwatchSeconds) : counter) : ''}
            </div>
          ))}
        </div>

        {isTime ? (
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <button className="btn" onClick={toggleStopwatch}>
              {stopwatchRunning ? 'Stop' : 'Start'}
            </button>
            <button className="btn btn--primary" onClick={commitSet}>
              Zapisz serię
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <button className="btn" onClick={() => setCounter((c) => Math.max(0, c - 1))}>
              −1
            </button>
            <button className="btn" onClick={() => setCounter((c) => c + 1)}>
              +1
            </button>
            <button className="btn btn--primary" onClick={commitSet}>
              Zapisz serię
            </button>
          </div>
        )}

        <RestTimer seconds={slot.restSeconds} />
      </div>

      <button className="btn" style={{ marginTop: 16 }} onClick={onCancel}>
        Przerwij trening
      </button>
    </div>
  )
}
