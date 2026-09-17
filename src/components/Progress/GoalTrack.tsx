interface Props {
  label: string
  start: number
  current: number
  goal?: number
  format: (v: number) => string
  higherIsBetter: boolean
}

export function GoalTrack({ label, start, current, goal, format, higherIsBetter }: Props) {
  const target = goal ?? current
  const values = [start, current, target]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  function positionOf(value: number): number {
    const pct = ((value - min) / span) * 100
    return higherIsBetter ? pct : 100 - pct
  }

  return (
    <div className="goal-track">
      <div className="goal-track__label">{label}</div>
      <div className="goal-track__line">
        <div
          className="goal-track__marker"
          style={{ left: `${positionOf(start)}%`, background: 'var(--text-faint)' }}
        />
        <div
          className="goal-track__marker-label"
          style={{ left: `${positionOf(start)}%`, color: 'var(--text-faint)' }}
        >
          START · {format(start)}
        </div>

        {goal !== undefined && (
          <>
            <div className="goal-track__marker" style={{ left: `${positionOf(goal)}%`, background: 'var(--warn)' }} />
            <div className="goal-track__marker-label" style={{ left: `${positionOf(goal)}%`, color: 'var(--warn)', top: -22 }}>
              CEL · {format(goal)}
            </div>
          </>
        )}

        <div className="goal-track__marker" style={{ left: `${positionOf(current)}%`, background: 'var(--accent)' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>Aktualnie: {format(current)}</div>
    </div>
  )
}
