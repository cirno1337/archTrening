import { useState } from 'react'
import {
  ACTIVITY_LABELS,
  ACTIVITY_MULTIPLIERS,
  BMI_CATEGORY_LABELS,
  classifyBmi,
  computeBmi,
  computeCalorieTargets,
} from '../../logic/calculators'
import type { ActivityLevel, Sex, UserProfile } from '../../models/types'

interface Props {
  profile: UserProfile | undefined
  onSave: (profile: UserProfile) => void
}

const ACTIVITY_OPTIONS = Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]

export function Calculator({ profile, onSave }: Props) {
  const [weightKg, setWeightKg] = useState(profile?.weightKg?.toString() ?? '')
  const [heightCm, setHeightCm] = useState(profile?.heightCm?.toString() ?? '')
  const [age, setAge] = useState(profile?.age?.toString() ?? '')
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'M')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel ?? 'umiarkowana')

  const weight = Number(weightKg)
  const height = Number(heightCm)
  const ageNum = Number(age)
  const canCompute = weight > 0 && height > 0 && ageNum > 0

  const currentProfile: UserProfile | null = canCompute
    ? { weightKg: weight, heightCm: height, age: ageNum, sex, activityLevel }
    : null

  const bmi = currentProfile ? computeBmi(currentProfile.weightKg, currentProfile.heightCm) : null
  const bmiCategory = bmi !== null ? classifyBmi(bmi) : null
  const calories = currentProfile ? computeCalorieTargets(currentProfile) : null

  function handleSave() {
    if (currentProfile) onSave(currentProfile)
  }

  return (
    <div className="main">
      <div className="page-title">KALKULATOR</div>
      <h1 className="page-heading">BMI i zapotrzebowanie kaloryczne</h1>

      <div className="panel">
        <div className="form-grid">
          <div className="field">
            <label>Waga (kg)</label>
            <input type="number" min={0} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="80" />
          </div>
          <div className="field">
            <label>Wzrost (cm)</label>
            <input type="number" min={0} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="180" />
          </div>
          <div className="field">
            <label>Wiek</label>
            <input type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} placeholder="28" />
          </div>
          <div className="field">
            <label>Płeć</label>
            <select value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="M">Mężczyzna</option>
              <option value="K">Kobieta</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Poziom aktywności</label>
            <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}>
              {ACTIVITY_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {ACTIVITY_LABELS[level]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn btn--primary" disabled={!currentProfile} onClick={handleSave}>
          Zapisz dane
        </button>
      </div>

      {bmi !== null && bmiCategory && calories && (
        <div className="panel">
          <div className="stat-row">
            <div className="stat">
              <div className="stat__label">BMI</div>
              <div className="stat__value">{bmi.toFixed(1)}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                {BMI_CATEGORY_LABELS[bmiCategory]}
              </div>
            </div>
            <div className="stat">
              <div className="stat__label">BMR (spoczynkowe)</div>
              <div className="stat__value">{Math.round(calories.bmr)} kcal</div>
            </div>
            <div className="stat">
              <div className="stat__label">Utrzymanie (TDEE)</div>
              <div className="stat__value">{Math.round(calories.maintenance)} kcal</div>
            </div>
          </div>

          <div className="exercise-list" style={{ marginTop: 20 }}>
            <div className="exercise-list__row">
              <span className="exercise-list__name">Redukcja</span>
              <span className="exercise-list__target">{Math.round(calories.cutting)} kcal</span>
            </div>
            <div className="exercise-list__row">
              <span className="exercise-list__name">Utrzymanie</span>
              <span className="exercise-list__target">{Math.round(calories.maintenance)} kcal</span>
            </div>
            <div className="exercise-list__row">
              <span className="exercise-list__name">Masa</span>
              <span className="exercise-list__target">{Math.round(calories.bulking)} kcal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
