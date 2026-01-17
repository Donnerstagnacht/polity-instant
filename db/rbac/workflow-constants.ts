/**
 * Amendment Workflow Status Constants
 *
 * Defines workflow statuses, transitions, and validation rules.
 */

/**
 * Workflow status types for amendments
 */
export type WorkflowStatus =
  | 'collaborative_editing' // Collaborators can directly edit
  | 'internal_suggesting' // Collaborators create suggestions
  | 'internal_voting' // Collaborators vote on suggestions
  | 'viewing' // Read-only mode
  | 'event_suggesting' // Event participants create suggestions
  | 'event_voting' // Event votes on suggestions sequentially
  | 'passed' // Final approval reached
  | 'rejected'; // Rejected at some point in process

/**
 * Amendment general status (legacy compatibility)
 */
export type AmendmentStatus =
  | 'draft'
  | 'in_progress'
  | 'passed'
  | 'rejected';

/**
 * Voting session types
 */
export type VotingSessionType = 'internal' | 'event';

/**
 * Voting session statuses
 */
export type VotingSessionStatus = 'pending' | 'active' | 'completed';

/**
 * Change request sources
 */
export type ChangeRequestSource = 'collaborator' | 'event_participant';

/**
 * Valid workflow status transitions
 * Key: current status, Value: array of allowed next statuses
 */
export const WORKFLOW_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  collaborative_editing: [
    'internal_suggesting',
    'internal_voting',
    'viewing',
    'event_suggesting',
  ],
  internal_suggesting: [
    'collaborative_editing',
    'internal_voting',
    'viewing',
    'event_suggesting',
  ],
  internal_voting: [
    'collaborative_editing',
    'internal_suggesting',
    'viewing',
    'event_suggesting',
  ],
  viewing: [
    'collaborative_editing',
    'internal_suggesting',
    'internal_voting',
    'event_suggesting',
  ],
  event_suggesting: ['event_voting', 'viewing', 'rejected'],
  event_voting: ['event_suggesting', 'passed', 'rejected'],
  passed: [], // Terminal state
  rejected: [], // Terminal state
};

/**
 * Workflow statuses available for manual selection by collaborators
 */
export const COLLABORATOR_SELECTABLE_STATUSES: WorkflowStatus[] = [
  'collaborative_editing',
  'internal_suggesting',
  'internal_voting',
  'viewing',
];

/**
 * Workflow statuses that require event organizer control
 */
export const EVENT_CONTROLLED_STATUSES: WorkflowStatus[] = [
  'event_suggesting',
  'event_voting',
];

/**
 * Terminal statuses (cannot transition from these)
 */
export const TERMINAL_STATUSES: WorkflowStatus[] = ['passed', 'rejected'];

/**
 * Workflow status display metadata
 */
export const WORKFLOW_STATUS_METADATA: Record<
  WorkflowStatus,
  {
    label: string;
    description: string;
    color: string;
    icon: string;
    allowedFor: ('collaborator' | 'event_organizer' | 'event_participant')[];
    readonly?: boolean;
  }
> = {
  collaborative_editing: {
    label: 'Gemeinsam Bearbeiten',
    description: 'Alle Collaborators können direkt bearbeiten',
    color: 'bg-blue-500',
    icon: 'Edit',
    allowedFor: ['collaborator'],
  },
  internal_suggesting: {
    label: 'Vorschläge Intern',
    description: 'Collaborators können Vorschläge einreichen',
    color: 'bg-purple-500',
    icon: 'MessageSquare',
    allowedFor: ['collaborator'],
  },
  internal_voting: {
    label: 'Interne Abstimmung',
    description: 'Abstimmung unter Collaborators (zeitbasiert)',
    color: 'bg-orange-500',
    icon: 'Vote',
    allowedFor: ['collaborator'],
  },
  viewing: {
    label: 'Ansicht',
    description: 'Nur-Lesen Modus',
    color: 'bg-gray-500',
    icon: 'Eye',
    allowedFor: ['collaborator', 'event_participant'],
  },
  event_suggesting: {
    label: 'Event Vorschläge',
    description: 'Event-Teilnehmer können Vorschläge einreichen',
    color: 'bg-teal-500',
    icon: 'Calendar',
    allowedFor: ['event_participant'],
    readonly: true,
  },
  event_voting: {
    label: 'Event Abstimmung',
    description: 'Event stimmt sequentiell über Änderungen ab',
    color: 'bg-red-500',
    icon: 'Gavel',
    allowedFor: ['event_participant'],
    readonly: true,
  },
  passed: {
    label: 'Angenommen',
    description: 'Amendment wurde angenommen',
    color: 'bg-green-500',
    icon: 'CheckCircle',
    allowedFor: [],
    readonly: true,
  },
  rejected: {
    label: 'Abgelehnt',
    description: 'Amendment wurde abgelehnt',
    color: 'bg-red-700',
    icon: 'XCircle',
    allowedFor: [],
    readonly: true,
  },
};

/**
 * Validate if a workflow status transition is allowed
 */
export function canTransitionTo(
  currentStatus: WorkflowStatus,
  targetStatus: WorkflowStatus
): boolean {
  const allowedTransitions = WORKFLOW_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(targetStatus);
}

/**
 * Check if a status is in an event phase
 */
export function isEventPhase(status: WorkflowStatus): boolean {
  return EVENT_CONTROLLED_STATUSES.includes(status) || TERMINAL_STATUSES.includes(status);
}

/**
 * Check if a status is terminal
 */
export function isTerminalStatus(status: WorkflowStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Check if a user can manually select a status
 */
export function isSelectableByCollaborator(status: WorkflowStatus): boolean {
  return COLLABORATOR_SELECTABLE_STATUSES.includes(status);
}

/**
 * Get the default workflow status for a new amendment
 */
export function getDefaultWorkflowStatus(): WorkflowStatus {
  return 'collaborative_editing';
}
