import { useState } from 'react'
import { getExercise } from '../../data/exercises'
import { formatDate, formatSeconds } from '../format'
import type { WorkoutLog } from '../../models/types'

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Bardzo łatwy',
  2: 'Łatwy',
  3: 'Odpowiedni',
  4: 'Trudny',
  5: 'Bardzo trudny',
}

interface Props {
  history: WorkoutLog[]
}

export function History({ history }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const sorted = [...history].reverse()

  return (
    <div className="main">
      <div className="page-title">HISTORIA</div>
      <h1 className="page-heading">Ukończone treningi</h1>

      {sorted.length === 0 ? (
        <div className="panel">
          <p className="empty-state">Brak ukończonych treningów.</p>
        </div>
      ) : (
        sorted.map((log) => (
          <div key={log.id}>
            <div className="history-row" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
              <span className="history-row__date">
                {formatDate(log.date)} — Trening {log.templateLetter} · tydzień {log.weekNumber}
              </span>
              <span className="history-row__status">✓ ukończony</span>
            </div>
            {expandedId === log.id && (
              <div className="panel" style={{ marginTop: -8, marginBottom: 16 }}>
                <p className="muted" style={{ marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  TRUDNOŚĆ: {DIFFICULTY_LABELS[log.difficulty]}
                </p>
                <div className="exercise-list">
                  {log.entries.map((entry) => {
                    const exercise = getExercise(entry.exerciseId)
                    const actual = entry.actualReps ?? entry.actualSeconds ?? []
                    const formatted = entry.actualSeconds ? actual.map(formatSeconds).join(' / ') : actual.join(' / ')
                    return (
                      <div className="exercise-list__row" key={entry.slotId}>
                        <span className="exercise-list__name">{exercise.name}</span>
                        <span className="exercise-list__target">{formatted}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
