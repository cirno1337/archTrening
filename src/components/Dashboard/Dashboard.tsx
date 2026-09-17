import { getExercise } from '../../data/exercises'
import { getCurrentWeek, getNextWorkoutLetter, isProgramFinished } from '../../logic/planGenerator'
import { formatDate, formatSlotTarget } from '../format'
import type { AppData } from '../../models/types'

interface Props {
  data: AppData
  onStartTraining: () => void
  onGoToTest: () => void
}

export function Dashboard({ data, onStartTraining, onGoToTest }: Props) {
  const { program, history } = data

  if (!program) {
    return (
      <div className="main">
        <div className="page-title">DASHBOARD</div>
        <h1 className="page-heading">Brak aktywnego programu</h1>
        <div className="panel">
          <p className="empty-state">
            Wykonaj test sprawnościowy, aby wygenerować spersonalizowany 8-tygodniowy program treningowy.
          </p>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn--primary" onClick={onGoToTest}>
              Wykonaj test sprawnościowy
            </button>
          </div>
        </div>
      </div>
    )
  }

  const week = getCurrentWeek(program)
  const finished = isProgramFinished(program)
  const nextLetter = getNextWorkoutLetter(program)
  const template = program.templates.find((t) => t.letter === nextLetter)!
  const recent = [...history].reverse().slice(0, 5)

  return (
    <div className="main">
      <div className="page-title">TRAINING</div>
      <h1 className="page-heading">
        Tydzień {week} / {program.totalWeeks}
      </h1>

      <div className="panel">
        <div className="progress-bar">
          <div
            className="progress-bar__fill"
            style={{ width: `${Math.min(100, (program.completedWorkoutIds.length / (program.totalWeeks * program.workoutsPerWeek)) * 100)}%` }}
          />
        </div>

        {finished ? (
          <p className="empty-state">
            Program ukończony. Wykonaj ponowny test sprawnościowy, aby ocenić progres i rozpocząć nowy program.
          </p>
        ) : (
          <>
            <div className="muted" style={{ marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              DZISIAJ
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>{template.name}</h2>

            <div className="exercise-list">
              {template.slots.map((slot) => (
                <div className="exercise-list__row" key={slot.slotId}>
                  <span className="exercise-list__name">{getExercise(slot.exerciseId).name}</span>
                  <span className="exercise-list__target">{formatSlotTarget(slot)}</span>
                </div>
              ))}
            </div>

            <button className="btn btn--primary" onClick={onStartTraining}>
              Rozpocznij trening
            </button>
          </>
        )}
      </div>

      <div className="panel">
        <h3 style={{ fontSize: 14, marginBottom: 16, color: 'var(--text-dim)' }}>Ostatnie treningi</h3>
        {recent.length === 0 ? (
          <p className="empty-state">Brak ukończonych treningów.</p>
        ) : (
          recent.map((log) => (
            <div className="history-row" key={log.id}>
              <span className="history-row__date">
                {formatDate(log.date)} — Trening {log.templateLetter}
              </span>
              <span className="history-row__status">✓ ukończony</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
