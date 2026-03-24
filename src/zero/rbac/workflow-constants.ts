/**
 * Amendment Editing Mode Constants
 *
 * Defines editing modes, transitions, and validation rules.
 * Unified type replaces the old WorkflowStatus and EditorMode.
 */

/**
 * Editing mode for amendments — single source of truth for both
 * the amendment lifecycle and the editor behaviour.
 */
export type EditingMode =
  | 'edit'              // Collaborators can directly edit
  | 'view'              // Read-only mode
  | 'suggest_internal'  // Collaborators create suggestions
  | 'suggest_event'     // Event participants create suggestions
  | 'vote_internal'     // Collaborators vote on suggestions
  | 'vote_event'        // Event votes on suggestions sequentially
  | 'passed'            // Final approval reached
  | 'rejected';         // Rejected at some point in process

/** @deprecated Use EditingMode instead */
export type WorkflowStatus = EditingMode;

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
 * Valid editing mode transitions
 * Key: current mode, Value: array of allowed next modes
 */
export const EDITING_MODE_TRANSITIONS: Record<EditingMode, EditingMode[]> = {
  edit: ['suggest_internal', 'suggest_event', 'vote_internal', 'vote_event', 'view'],
  view: ['edit', 'suggest_internal', 'suggest_event', 'vote_internal', 'vote_event'],
  suggest_internal: ['edit', 'view', 'vote_internal', 'suggest_event', 'vote_event'],
  suggest_event: ['vote_event', 'view', 'rejected'],
  vote_internal: ['edit', 'view', 'suggest_internal', 'suggest_event', 'vote_event'],
  vote_event: ['suggest_event', 'passed', 'rejected'],
  passed: [],   // Terminal state
  rejected: [], // Terminal state
};

/** @deprecated Use EDITING_MODE_TRANSITIONS instead */
export const WORKFLOW_TRANSITIONS = EDITING_MODE_TRANSITIONS;

/**
 * Non-terminal editing modes available for manual selection
 */
export const SELECTABLE_MODES: EditingMode[] = [
  'edit',
  'view',
  'suggest_internal',
  'suggest_event',
  'vote_internal',
  'vote_event',
];

/** @deprecated Use SELECTABLE_MODES instead */
export const COLLABORATOR_SELECTABLE_STATUSES = SELECTABLE_MODES;

/**
 * Event-phase editing modes
 */
export const EVENT_MODES: EditingMode[] = [
  'suggest_event',
  'vote_event',
];

/** @deprecated Use EVENT_MODES instead */
export const EVENT_CONTROLLED_STATUSES = EVENT_MODES;

/**
 * Terminal modes (cannot transition from these)
 */
export const TERMINAL_MODES: EditingMode[] = ['passed', 'rejected'];

/** @deprecated Use TERMINAL_MODES instead */
export const TERMINAL_STATUSES = TERMINAL_MODES;

/**
 * Editing mode display metadata
 */
export const EDITING_MODE_METADATA: Record<
  EditingMode,
  {
    label: string;
    description: string;
    color: string;
    icon: string;
  }
> = {
  edit: {
    label: 'Bearbeiten',
    description: 'Alle Collaborators können direkt bearbeiten',
    color: 'bg-blue-500',
    icon: 'Edit',
  },
  view: {
    label: 'Ansicht',
    description: 'Nur-Lesen Modus',
    color: 'bg-gray-500',
    icon: 'Eye',
  },
  suggest_internal: {
    label: 'Vorschläge Intern',
    description: 'Collaborators können Vorschläge einreichen',
    color: 'bg-purple-500',
    icon: 'MessageSquare',
  },
  suggest_event: {
    label: 'Event Vorschläge',
    description: 'Event-Teilnehmer können Vorschläge einreichen',
    color: 'bg-teal-500',
    icon: 'Calendar',
  },
  vote_internal: {
    label: 'Interne Abstimmung',
    description: 'Abstimmung unter Collaborators (zeitbasiert)',
    color: 'bg-orange-500',
    icon: 'Vote',
  },
  vote_event: {
    label: 'Event Abstimmung',
    description: 'Event stimmt sequentiell über Änderungen ab',
    color: 'bg-red-500',
    icon: 'Gavel',
  },
  passed: {
    label: 'Angenommen',
    description: 'Amendment wurde angenommen',
    color: 'bg-green-500',
    icon: 'CheckCircle',
  },
  rejected: {
    label: 'Abgelehnt',
    description: 'Amendment wurde abgelehnt',
    color: 'bg-red-700',
    icon: 'XCircle',
  },
};

/** @deprecated Use EDITING_MODE_METADATA instead */
export const WORKFLOW_STATUS_METADATA = EDITING_MODE_METADATA;

/**
 * Map of legacy editing_mode DB values to new EditingMode values.
 */
const LEGACY_MODE_MAP: Record<string, EditingMode> = {
  collaborative_editing: 'edit',
  internal_suggesting: 'suggest_internal',
  internal_voting: 'vote_internal',
  viewing: 'view',
  event_suggesting: 'suggest_event',
  event_voting: 'vote_event',
  Drafting: 'edit',
  'Under Review': 'suggest_internal',
  Passed: 'passed',
  Rejected: 'rejected',
};

/**
 * Normalize a raw DB value to a valid EditingMode.
 * Maps legacy values (collaborative_editing, Drafting, etc.) to new ones.
 */
export function normalizeEditingMode(raw: string | null | undefined): EditingMode {
  if (!raw) return 'edit';
  if (EDITING_MODE_METADATA[raw as EditingMode]) return raw as EditingMode;
  return LEGACY_MODE_MAP[raw] ?? 'edit';
}

/**
 * Validate if an editing mode transition is allowed
 */
export function canTransitionTo(
  currentMode: EditingMode,
  targetMode: EditingMode
): boolean {
  const allowed = EDITING_MODE_TRANSITIONS[currentMode];
  return allowed.includes(targetMode);
}

/**
 * Check if a mode is in an event phase
 */
export function isEventPhase(mode: EditingMode): boolean {
  return EVENT_MODES.includes(mode) || TERMINAL_MODES.includes(mode);
}

/**
 * Check if a mode is terminal
 */
export function isTerminalStatus(mode: EditingMode): boolean {
  return TERMINAL_MODES.includes(mode);
}

/**
 * Check if a mode is a voting mode
 */
export function isVotingMode(mode: EditingMode): boolean {
  return mode === 'vote_internal' || mode === 'vote_event';
}

/**
 * Check if a mode is a suggesting mode
 */
export function isSuggestingMode(mode: EditingMode): boolean {
  return mode === 'suggest_internal' || mode === 'suggest_event';
}

/**
 * Check if a user can manually select a mode
 */
export function isSelectableByCollaborator(mode: EditingMode): boolean {
  return SELECTABLE_MODES.includes(mode);
}

/**
 * Get the default editing mode for a new amendment
 */
export function getDefaultEditingMode(): EditingMode {
  return 'edit';
}

/** @deprecated Use getDefaultEditingMode instead */
export function getDefaultWorkflowStatus(): EditingMode {
  return getDefaultEditingMode();
}
