/**
 * Group Feature Types
 *
 * Entity types are re-exported from Zero (single source of truth).
 * UI-only types are defined locally.
 */

// ── Zero-derived entity types ───────────────────────────────────────
export type { GroupMembershipWithRolesAndRightsRow as GroupMembershipWithUser } from '@/zero/groups/queries';
export type { GroupRoleWithRightsRow as GroupRole } from '@/zero/groups/queries';
export type { GroupLinkRow as GroupLink } from '@/zero/groups/queries';
export type { GroupPaymentRow as GroupPayment } from '@/zero/groups/queries';

// ── UI-only types (not in Zero schema) ──────────────────────────────

export interface ActionRightOption {
  resource: string;
  action: string;
  label: string;
}

export interface FinancialSummary {
  income: number;
  expenditure: number;
  balance: number;
}

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}

export type MembershipTab = 'memberships' | 'roles' | 'positions';
export type TodoViewMode = 'kanban' | 'list';
