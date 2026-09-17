import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyData, exportDataToJson, importDataFromJson, loadData, saveData } from './storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty data when nothing has been saved yet', () => {
    expect(loadData()).toEqual(createEmptyData())
  })

  it('round-trips data through save and load', () => {
    const data = createEmptyData()
    data.goals = { pullUps: 5 }
    saveData(data)
    expect(loadData()).toEqual(data)
  })

  it('round-trips data through export and import JSON', () => {
    const data = createEmptyData()
    data.goals = { pushUps: 30 }
    const json = exportDataToJson(data)
    expect(importDataFromJson(json)).toEqual(data)
  })

  it('rejects invalid JSON payloads on import', () => {
    expect(() => importDataFromJson('{"foo": "bar"}')).toThrow()
  })
})
