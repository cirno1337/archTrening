import { describe, expect, it } from 'vitest'
import { classifyBmi, computeBmi, computeBmr, computeCalorieTargets, computeTdee } from './calculators'

describe('computeBmi / classifyBmi', () => {
  it('computes BMI from weight and height', () => {
    expect(computeBmi(80, 180)).toBeCloseTo(24.69, 1)
  })

  it('classifies BMI into the standard WHO categories', () => {
    expect(classifyBmi(17)).toBe('niedowaga')
    expect(classifyBmi(22)).toBe('prawidlowa')
    expect(classifyBmi(27)).toBe('nadwaga')
    expect(classifyBmi(32)).toBe('otylosc')
  })
})

describe('computeBmr / computeTdee', () => {
  it('computes BMR higher for men than women with the same stats (Mifflin-St Jeor offset)', () => {
    const stats = { weightKg: 80, heightCm: 180, age: 30 }
    const bmrMale = computeBmr({ ...stats, sex: 'M' })
    const bmrFemale = computeBmr({ ...stats, sex: 'K' })
    expect(bmrMale - bmrFemale).toBeCloseTo(166, 0)
  })

  it('scales TDEE by the activity multiplier', () => {
    const bmr = 1700
    expect(computeTdee(bmr, 'siedzacy')).toBeCloseTo(2040, 0)
    expect(computeTdee(bmr, 'bardzo-wysoka')).toBeCloseTo(3230, 0)
  })
})

describe('computeCalorieTargets', () => {
  it('returns a deficit below and a surplus above maintenance', () => {
    const targets = computeCalorieTargets({ weightKg: 80, heightCm: 180, age: 30, sex: 'M', activityLevel: 'umiarkowana' })
    expect(targets.cutting).toBeLessThan(targets.maintenance)
    expect(targets.bulking).toBeGreaterThan(targets.maintenance)
  })
})
