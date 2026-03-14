import { RRule, Weekday } from 'rrule'

export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'four-yearly'

export interface RecurrenceFormState {
  pattern: RecurrencePattern
  interval: number
  /** 0=Mon..6=Sun (ISO weekday - 1) for rrule.js compatibility */
  weekdays: number[]
  endDate: string | null
}

const WEEKDAY_MAP: Weekday[] = [
  RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU,
]

const FREQ_MAP: Record<string, number> = {
  daily: RRule.DAILY,
  weekly: RRule.WEEKLY,
  monthly: RRule.MONTHLY,
  yearly: RRule.YEARLY,
  'four-yearly': RRule.YEARLY,
}

/** Convert UI form state → RRULE string (RFC 5545). */
export function buildRRule(state: RecurrenceFormState): string | null {
  if (state.pattern === 'none') return null

  const freq = FREQ_MAP[state.pattern]
  if (freq === undefined) return null

  const options: Partial<ConstructorParameters<typeof RRule>[0]> = {
    freq,
    interval: state.pattern === 'four-yearly' ? 4 * (state.interval || 1) : (state.interval || 1),
  }

  if (state.pattern === 'weekly' && state.weekdays.length > 0) {
    options.byweekday = state.weekdays.map(d => WEEKDAY_MAP[d])
  }

  if (state.endDate) {
    options.until = new Date(state.endDate)
  }

  return new RRule(options as ConstructorParameters<typeof RRule>[0]).toString().replace('RRULE:', '')
}

/** Convert RRULE string → UI form state (for editing). */
export function parseRRuleToFormState(rruleStr: string): RecurrenceFormState {
  const rule = RRule.fromString(
    rruleStr.startsWith('RRULE:') ? rruleStr : `RRULE:${rruleStr}`,
  )
  const opts = rule.origOptions

  let pattern: RecurrencePattern = 'none'
  const interval = opts.interval ?? 1

  switch (opts.freq) {
    case RRule.DAILY:
      pattern = 'daily'
      break
    case RRule.WEEKLY:
      pattern = 'weekly'
      break
    case RRule.MONTHLY:
      pattern = 'monthly'
      break
    case RRule.YEARLY:
      pattern = interval >= 4 && interval % 4 === 0 ? 'four-yearly' : 'yearly'
      break
  }

  const weekdays: number[] = []
  if (opts.byweekday) {
    const days = Array.isArray(opts.byweekday) ? opts.byweekday : [opts.byweekday]
    const weekdayStrMap: Record<string, number> = { MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6 }
    for (const d of days) {
      if (typeof d === 'number') {
        weekdays.push(d)
      } else if (typeof d === 'string') {
        weekdays.push(weekdayStrMap[d] ?? 0)
      } else {
        weekdays.push(d.weekday)
      }
    }
  }

  return {
    pattern,
    interval: pattern === 'four-yearly' ? Math.round(interval / 4) : interval,
    weekdays,
    endDate: opts.until ? opts.until.toISOString().split('T')[0] : null,
  }
}

/** Human-readable recurrence description. */
export function getRecurrenceDescription(
  rruleStr: string | null | undefined,
  t: (key: string) => string,
): string {
  if (!rruleStr) return t('pages.create.event.recurringPatterns.none')

  try {
    const state = parseRRuleToFormState(rruleStr)
    const dayNames = [
      t('common.days.monday'),
      t('common.days.tuesday'),
      t('common.days.wednesday'),
      t('common.days.thursday'),
      t('common.days.friday'),
      t('common.days.saturday'),
      t('common.days.sunday'),
    ]

    switch (state.pattern) {
      case 'daily':
        return state.interval === 1
          ? t('pages.create.event.recurringPatterns.daily')
          : `${t('pages.create.event.recurringPatterns.daily')} (${state.interval})`
      case 'weekly': {
        const days = state.weekdays.map(d => dayNames[d]).join(', ')
        return days
          ? `${t('pages.create.event.recurringPatterns.weekly')}: ${days}`
          : t('pages.create.event.recurringPatterns.weekly')
      }
      case 'monthly':
        return t('pages.create.event.recurringPatterns.monthly')
      case 'yearly':
        return state.interval > 1
          ? `${t('pages.create.event.recurringPatterns.yearly')} (${state.interval})`
          : t('pages.create.event.recurringPatterns.yearly')
      case 'four-yearly':
        return t('pages.create.event.recurringPatterns.fourYearly')
      default:
        return rruleStr
    }
  } catch {
    return rruleStr
  }
}
