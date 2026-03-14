import { describe, expect, it } from 'vitest'

import { matchInviteCsvUsers } from '../groupInviteCsv'

describe('matchInviteCsvUsers', () => {
  const users = [
    { id: '1', first_name: 'Ada', last_name: 'Lovelace', handle: 'ada' },
    { id: '2', first_name: 'Grace', last_name: 'Hopper', handle: 'grace' },
    { id: '3', first_name: 'Alex', last_name: 'Kim', handle: 'alex-kim-1' },
    { id: '4', first_name: 'Alex', last_name: 'Kim', handle: 'alex-kim-2' },
  ]

  it('matches unique full names and reports missing users', () => {
    const csv = [
      'first name,last name',
      'Ada,Lovelace',
      'Unknown,Person',
    ].join('\n')

    const result = matchInviteCsvUsers(csv, users)

    expect(result.missingColumns).toBe(false)
    expect(result.matchedUsers).toEqual([{ id: '1', name: 'Ada Lovelace' }])
    expect(result.notFoundNames).toEqual(['Unknown Person'])
    expect(result.ambiguousNames).toEqual([])
  })

  it('marks duplicate name matches as ambiguous instead of inviting both', () => {
    const csv = [
      'first name,last name',
      'Alex,Kim',
    ].join('\n')

    const result = matchInviteCsvUsers(csv, users)

    expect(result.matchedUsers).toEqual([])
    expect(result.notFoundNames).toEqual([])
    expect(result.ambiguousNames).toHaveLength(1)
    expect(result.ambiguousNames[0]).toEqual({
      fullName: 'Alex Kim',
      candidates: [
        { id: '3', name: 'Alex Kim' },
        { id: '4', name: 'Alex Kim' },
      ],
    })
  })

  it('accepts german-style headers and skips incomplete rows', () => {
    const csv = [
      'Vorname,Nachname',
      'Grace,Hopper',
      'Ada,',
    ].join('\n')

    const result = matchInviteCsvUsers(csv, users)

    expect(result.missingColumns).toBe(false)
    expect(result.matchedUsers).toEqual([{ id: '2', name: 'Grace Hopper' }])
    expect(result.invalidRows).toEqual(['Row 3: Ada,'])
  })

  it('reports missing required columns', () => {
    const csv = [
      'email,name',
      'ada@example.com,Ada Lovelace',
    ].join('\n')

    const result = matchInviteCsvUsers(csv, users)

    expect(result.missingColumns).toBe(true)
    expect(result.totalRows).toBe(0)
    expect(result.matchedUsers).toEqual([])
  })
})