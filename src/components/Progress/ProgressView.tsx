import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDate, formatSeconds } from '../format'
import { GoalTrack } from './GoalTrack'
import type { FitnessTestResult, Goals } from '../../models/types'

interface Props {
  tests: FitnessTestResult[]
  goals: Goals
}

interface MetricConfig {
  key: keyof Pick<FitnessTestResult, 'pushUps' | 'pullUps' | 'squats2min' | 'plankSeconds' | 'run3kmSeconds'>
  label: string
  goalKey: keyof Goals
  format: (v: number) => string
  higherIsBetter: boolean
}

const METRICS: MetricConfig[] = [
  { key: 'pullUps', label: 'Podciągnięcia', goalKey: 'pullUps', format: (v) => `${v}`, higherIsBetter: true },
  { key: 'pushUps', label: 'Pompki', goalKey: 'pushUps', format: (v) => `${v}`, higherIsBetter: true },
  { key: 'squats2min', label: 'Przysiady / 2 min', goalKey: 'squats2min', format: (v) => `${v}`, higherIsBetter: true },
  { key: 'plankSeconds', label: 'Plank', goalKey: 'plankSeconds', format: formatSeconds, higherIsBetter: true },
  { key: 'run3kmSeconds', label: 'Bieg 3 km', goalKey: 'run3kmSeconds', format: formatSeconds, higherIsBetter: false },
]

export function ProgressView({ tests, goals }: Props) {
  if (tests.length === 0) {
    return (
      <div className="main">
        <div className="page-title">PROGRES</div>
        <h1 className="page-heading">Brak danych</h1>
        <div className="panel">
          <p className="empty-state">Wykonaj przynajmniej jeden test sprawnościowy, aby zobaczyć progres.</p>
        </div>
      </div>
    )
  }

  const sorted = [...tests].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  return (
    <div className="main">
      <div className="page-title">PROGRES</div>
      <h1 className="page-heading">Rozwój sprawności</h1>

      <div className="panel">
        {METRICS.map((metric) => (
          <GoalTrack
            key={metric.key}
            label={metric.label}
            start={first[metric.key]}
            current={last[metric.key]}
            goal={goals[metric.goalKey]}
            format={metric.format}
            higherIsBetter={metric.higherIsBetter}
          />
        ))}
      </div>

      {METRICS.map((metric) => {
        const chartData = sorted.map((t) => ({ date: formatDate(t.date), value: t[metric.key] }))
        return (
          <div className="panel" key={metric.key}>
            <h3 style={{ fontSize: 13, marginBottom: 16, color: 'var(--text-dim)' }}>{metric.label}</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#565f68" fontSize={11} tickLine={false} />
                <YAxis stroke="#565f68" fontSize={11} tickLine={false} width={40} tickFormatter={metric.key.includes('Seconds') ? (v) => formatSeconds(Number(v)) : undefined} />
                <Tooltip
                  contentStyle={{ background: '#171b20', border: '1px solid #262c33', fontFamily: 'var(--font-mono)', fontSize: 12 }}
                  formatter={(value) => metric.format(Number(value))}
                />
                <Line type="monotone" dataKey="value" stroke="#7fd1a8" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )
      })}
    </div>
  )
}
