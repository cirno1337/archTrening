import { useState } from 'react'
import { LEVEL_LABELS } from '../../data/standards'
import { parseTimeToSeconds } from '../format'
import type { FitnessTestResult } from '../../models/types'

interface Props {
  hasProgram: boolean
  onSave: (result: Omit<FitnessTestResult, 'id' | 'level'>) => FitnessTestResult
  onGenerateProgram: (test: FitnessTestResult) => void
}

export function FitnessTest({ hasProgram, onSave, onGenerateProgram }: Props) {
  const [pushUps, setPushUps] = useState('')
  const [pullUps, setPullUps] = useState('')
  const [squats2min, setSquats2min] = useState('')
  const [plank, setPlank] = useState('')
  const [run3km, setRun3km] = useState('')
  const [savedResult, setSavedResult] = useState<FitnessTestResult | null>(null)

  const canSave = pushUps !== '' && pullUps !== '' && squats2min !== '' && plank !== '' && run3km !== ''

  function handleSave() {
    const result = onSave({
      date: new Date().toISOString(),
      pushUps: Number(pushUps),
      pullUps: Number(pullUps),
      squats2min: Number(squats2min),
      plankSeconds: parseTimeToSeconds(plank),
      run3kmSeconds: parseTimeToSeconds(run3km),
    })
    setSavedResult(result)
  }

  if (savedResult) {
    return (
      <div className="main">
        <div className="page-title">TEST SPRAWNOŚCIOWY</div>
        <h1 className="page-heading">Wynik zapisany</h1>
        <div className="panel">
          <div className="stat-row">
            <div className="stat">
              <div className="stat__label">Poziom</div>
              <div className="stat__value">{LEVEL_LABELS[savedResult.level]}</div>
            </div>
          </div>
          <p className="empty-state" style={{ marginTop: 20 }}>
            {hasProgram
              ? 'Wynik testu został zapisany w historii progresu.'
              : 'Na podstawie wyniku możesz teraz wygenerować spersonalizowany program treningowy.'}
          </p>
          {!hasProgram && (
            <div style={{ marginTop: 20 }}>
              <button className="btn btn--primary" onClick={() => onGenerateProgram(savedResult)}>
                Wygeneruj plan treningowy
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="main">
      <div className="page-title">TEST SPRAWNOŚCIOWY</div>
      <h1 className="page-heading">Wykonaj test</h1>
      <div className="panel">
        <div className="form-grid">
          <div className="field">
            <label>Pompki (max)</label>
            <input type="number" min={0} value={pushUps} onChange={(e) => setPushUps(e.target.value)} placeholder="20" />
          </div>
          <div className="field">
            <label>Podciągnięcia (max)</label>
            <input type="number" min={0} value={pullUps} onChange={(e) => setPullUps(e.target.value)} placeholder="2" />
          </div>
          <div className="field">
            <label>Przysiady / 2 min</label>
            <input type="number" min={0} value={squats2min} onChange={(e) => setSquats2min(e.target.value)} placeholder="54" />
          </div>
          <div className="field">
            <label>Plank (mm:ss)</label>
            <input value={plank} onChange={(e) => setPlank(e.target.value)} placeholder="1:10" />
          </div>
          <div className="field">
            <label>Bieg 3 km (mm:ss)</label>
            <input value={run3km} onChange={(e) => setRun3km(e.target.value)} placeholder="15:42" />
          </div>
        </div>
        <button className="btn btn--primary" disabled={!canSave} onClick={handleSave}>
          Zapisz test
        </button>
      </div>
    </div>
  )
}
