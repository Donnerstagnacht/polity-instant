interface CsvInviteRow {
  firstName: string
  lastName: string
  fullName: string
  rowNumber: number
}

interface MatchableUser {
  id: string
  first_name?: string | null
  last_name?: string | null
  handle?: string | null
  email?: string | null
}

interface MatchedInviteUser {
  id: string
  name: string
}

interface AmbiguousInviteMatch {
  fullName: string
  candidates: MatchedInviteUser[]
}

interface ParsedInviteCsv {
  rows: CsvInviteRow[]
  invalidRows: string[]
  missingColumns: boolean
}

export interface InviteCsvMatchResult {
  matchedUsers: MatchedInviteUser[]
  notFoundNames: string[]
  ambiguousNames: AmbiguousInviteMatch[]
  invalidRows: string[]
  totalRows: number
  missingColumns: boolean
}

function normalizeValue(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function getUserDisplayName(user: MatchableUser): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return fullName || user.handle || user.email || user.id
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index++) {
    const character = line[index]

    if (character === '"') {
      const nextCharacter = line[index + 1]
      if (inQuotes && nextCharacter === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (character === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += character
  }

  values.push(current.trim())
  return values
}

function parseInviteCsv(text: string): ParsedInviteCsv {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return {
      rows: [],
      invalidRows: [],
      missingColumns: true,
    }
  }

  const header = parseCsvLine(lines[0]).map(column => normalizeValue(column))
  const firstNameIndex = header.findIndex(column => (
    column === 'first name' || column === 'firstname' || column === 'first_name' || column === 'vorname'
  ))
  const lastNameIndex = header.findIndex(column => (
    column === 'last name' || column === 'lastname' || column === 'last_name' || column === 'nachname'
  ))

  if (firstNameIndex === -1 || lastNameIndex === -1) {
    return {
      rows: [],
      invalidRows: [],
      missingColumns: true,
    }
  }

  const rows: CsvInviteRow[] = []
  const invalidRows: string[] = []

  lines.slice(1).forEach((line, index) => {
    const values = parseCsvLine(line)
    const firstName = values[firstNameIndex]?.trim() ?? ''
    const lastName = values[lastNameIndex]?.trim() ?? ''
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()

    if (!firstName || !lastName) {
      invalidRows.push(`Row ${index + 2}: ${line}`)
      return
    }

    rows.push({
      firstName,
      lastName,
      fullName,
      rowNumber: index + 2,
    })
  })

  return {
    rows,
    invalidRows,
    missingColumns: false,
  }
}

export function matchInviteCsvUsers(
  text: string,
  users: MatchableUser[],
  options: { excludeUserId?: string } = {},
): InviteCsvMatchResult {
  const { rows, invalidRows, missingColumns } = parseInviteCsv(text)

  if (missingColumns) {
    return {
      matchedUsers: [],
      notFoundNames: [],
      ambiguousNames: [],
      invalidRows,
      totalRows: 0,
      missingColumns: true,
    }
  }

  const searchableUsers = users.filter(user => user.id !== options.excludeUserId)
  const userIndex = new Map<string, MatchableUser[]>()

  for (const user of searchableUsers) {
    const key = normalizeValue(`${user.first_name ?? ''} ${user.last_name ?? ''}`)
    if (!key) continue
    const existing = userIndex.get(key) ?? []
    existing.push(user)
    userIndex.set(key, existing)
  }

  const matchedUsersById = new Map<string, MatchedInviteUser>()
  const ambiguousByName = new Map<string, AmbiguousInviteMatch>()
  const notFoundNames = new Set<string>()

  for (const row of rows) {
    const key = normalizeValue(`${row.firstName} ${row.lastName}`)
    const matches = userIndex.get(key) ?? []

    if (matches.length === 1) {
      const match = matches[0]
      matchedUsersById.set(match.id, {
        id: match.id,
        name: getUserDisplayName(match),
      })
      continue
    }

    if (matches.length > 1) {
      ambiguousByName.set(row.fullName, {
        fullName: row.fullName,
        candidates: matches.map(match => ({
          id: match.id,
          name: getUserDisplayName(match),
        })),
      })
      continue
    }

    notFoundNames.add(row.fullName)
  }

  return {
    matchedUsers: [...matchedUsersById.values()],
    notFoundNames: [...notFoundNames.values()],
    ambiguousNames: [...ambiguousByName.values()],
    invalidRows,
    totalRows: rows.length,
    missingColumns: false,
  }
}