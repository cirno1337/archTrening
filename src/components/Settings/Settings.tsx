import { useRef, useState } from 'react'
import { formatSeconds, parseTimeToSeconds } from '../format'
import type { Goals } from '../../models/types'

interface Props {
  goals: Goals
  hasProgram: boolean
  onSaveGoals: (goals: Goals) => void
  onExport: () => string
  onImport: (json: string) => void
  onResetProgram: () => void
}

export function Settings({ goals, hasProgram, onSaveGoals, onExport, onImport, onResetProgram }: Props) {
  const [pullUps, setPullUps] = useState(goals.pullUps?.toString() ?? '')
  const [pushUps, setPushUps] = useState(goals.pushUps?.toString() ?? '')
  const [squats2min, setSquats2min] = useState(goals.squats2min?.toString() ?? '')
  const [plank, setPlank] = useState(goals.plankSeconds !== undefined ? formatSeconds(goals.plankSeconds) : '')
  const [run3km, setRun3km] = useState(goals.run3kmSeconds !== undefined ? formatSeconds(goals.run3kmSeconds) : '')
  const [confirmReset, setConfirmReset] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function handleSaveGoals() {
    onSaveGoals({
      pullUps: pullUps === '' ? undefined : Number(pullUps),
      pushUps: pushUps === '' ? undefined : Number(pushUps),
      squats2min: squats2min === '' ? undefined : Number(squats2min),
      plankSeconds: plank === '' ? undefined : parseTimeToSeconds(plank),
      run3kmSeconds: run3km === '' ? undefined : parseTimeToSeconds(run3km),
    })
  }

  function handleExport() {
    const json = onExport()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `archtrening-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        onImport(String(reader.result))
        setImportError(null)
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Nie udało się zaimportować danych.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="main">
      <div className="page-title">USTAWIENIA</div>
      <h1 className="page-heading">Ustawienia</h1>

      <div className="panel">
        <h3 style={{ fontSize: 14, marginBottom: 16, color: 'var(--text-dim)' }}>Cele treningowe</h3>
        <div className="form-grid">
          <div className="field">
            <label>Podciągnięcia</label>
            <input value={pullUps} onChange={(e) => setPullUps(e.target.value)} placeholder="5" />
          </div>
          <div className="field">
            <label>Pompki</label>
            <input value={pushUps} onChange={(e) => setPushUps(e.target.value)} placeholder="35" />
          </div>
          <div className="field">
            <label>Przysiady / 2 min</label>
            <input value={squats2min} onChange={(e) => setSquats2min(e.target.value)} placeholder="60" />
          </div>
          <div className="field">
            <label>Plank (mm:ss)</label>
            <input value={plank} onChange={(e) => setPlank(e.target.value)} placeholder="2:00" />
          </div>
          <div className="field">
            <label>Bieg 3 km (mm:ss)</label>
            <input value={run3km} onChange={(e) => setRun3km(e.target.value)} placeholder="14:30" />
          </div>
        </div>
        <button className="btn btn--primary" onClick={handleSaveGoals}>
          Zapisz cele
        </button>
      </div>

      <div className="panel">
        <h3 style={{ fontSize: 14, marginBottom: 16, color: 'var(--text-dim)' }}>Dane</h3>
        <p className="empty-state" style={{ marginBottom: 16 }}>
          Wszystkie dane są przechowywane lokalnie w przeglądarce. Wyeksportuj je, aby zrobić kopię zapasową lub przenieść na inne urządzenie.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={handleExport}>
            Eksportuj dane
          </button>
          <button className="btn" onClick={() => fileInputRef.current?.click()}>
            Importuj dane
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImportFile} />
        </div>
        {importError && (
          <p style={{ color: 'var(--danger)', marginTop: 12, fontSize: 13 }}>{importError}</p>
        )}
      </div>

      <div className="panel">
        <h3 style={{ fontSize: 14, marginBottom: 16, color: 'var(--text-dim)' }}>Program</h3>
        <p className="empty-state" style={{ marginBottom: 16 }}>
          Rozpoczęcie nowego programu zastąpi aktualny plan i progresję ćwiczeń. Historia treningów i testów zostanie
          zachowana.
        </p>
        <button className="btn btn--danger" disabled={!hasProgram} onClick={() => setConfirmReset(true)}>
          Nowy program
        </button>
      </div>

      {confirmReset && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Czy na pewno chcesz zresetować aktualny program treningowy? Historia i testy pozostaną zachowane.</p>
            <div className="confirm-box__actions">
              <button className="btn" onClick={() => setConfirmReset(false)}>
                Anuluj
              </button>
              <button
                className="btn btn--danger"
                onClick={() => {
                  onResetProgram()
                  setConfirmReset(false)
                }}
              >
                Resetuj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
