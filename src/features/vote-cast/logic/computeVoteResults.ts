/**
 * Pure functions for computing amendment/discussion vote results.
 * Supports grouped indicative + final vote tallying with multiple majority types.
 *
 * Works with the new choice-based decision model:
 * - vote_choice rows define available options (default: Yes/No/Abstain)
 * - indicative_choice_decision / final_choice_decision rows record each voter's pick
 */

export type MajorityType = 'simple' | 'absolute' | 'two_thirds'
export type VoteResult = 'passed' | 'rejected' | 'tie'

export interface ChoiceInfo {
  id: string
  label: string
  order_index: number
}

export interface ChoiceDecision {
  choice_id: string
}

export interface ChoiceTally {
  choiceId: string
  label: string
  count: number
  percent: number
}

export interface VoteResultSummary {
  result: VoteResult
  choiceTallies: ChoiceTally[]
  totalEligible: number
  totalVoted: number
  winningChoiceId: string | null
  winningLabel: string | null
  majorityType: MajorityType
}

/**
 * Tally decisions per choice.
 */
export function tallyChoiceDecisions(
  choices: ReadonlyArray<ChoiceInfo>,
  decisions: ReadonlyArray<ChoiceDecision>,
): ChoiceTally[] {
  const total = decisions.length || 1

  return choices.map((c) => {
    const count = decisions.filter((d) => d.choice_id === c.id).length
    return {
      choiceId: c.id,
      label: c.label,
      count,
      percent: Math.round((count / total) * 100),
    }
  })
}

/**
 * Determine the vote result based on the majority type and tallies.
 * "Yes" is the first choice (order_index 0), "No" is second (order_index 1).
 * Abstain (order_index 2) is not counted towards the result.
 */
export function computeVoteResult(
  acceptCount: number,
  rejectCount: number,
  totalEligible: number,
  majorityType: MajorityType,
): VoteResult {
  if (acceptCount === rejectCount) return 'tie'

  switch (majorityType) {
    case 'absolute':
      return acceptCount > totalEligible / 2 ? 'passed' : 'rejected'
    case 'two_thirds':
      return acceptCount >= (totalEligible * 2) / 3 ? 'passed' : 'rejected'
    case 'simple':
    default:
      return acceptCount > rejectCount ? 'passed' : 'rejected'
  }
}

/**
 * Compute full vote results including percentages and winning choice.
 */
export function computeVoteResultSummary(
  choices: ReadonlyArray<ChoiceInfo>,
  decisions: ReadonlyArray<ChoiceDecision>,
  totalEligible: number,
  majorityType: MajorityType,
): VoteResultSummary {
  const tallies = tallyChoiceDecisions(choices, decisions)

  // Identify Yes/No choices by order_index convention
  const sortedChoices = [...choices].sort((a, b) => a.order_index - b.order_index)
  const yesChoice = sortedChoices[0]
  const noChoice = sortedChoices[1]

  const acceptCount = yesChoice
    ? decisions.filter((d) => d.choice_id === yesChoice.id).length
    : 0
  const rejectCount = noChoice
    ? decisions.filter((d) => d.choice_id === noChoice.id).length
    : 0

  const result = computeVoteResult(acceptCount, rejectCount, totalEligible, majorityType)

  let winningChoiceId: string | null = null
  let winningLabel: string | null = null
  if (result === 'passed' && yesChoice) {
    winningChoiceId = yesChoice.id
    winningLabel = yesChoice.label
  } else if (result === 'rejected' && noChoice) {
    winningChoiceId = noChoice.id
    winningLabel = noChoice.label
  }

  return {
    result,
    choiceTallies: tallies,
    totalEligible,
    totalVoted: decisions.length,
    winningChoiceId,
    winningLabel,
    majorityType,
  }
}
