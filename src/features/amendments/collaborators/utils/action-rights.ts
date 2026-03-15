/**
 * Action rights definitions for amendment collaborators
 */

import { AMENDMENT_ACTION_RIGHTS } from '@/zero/rbac/constants';

export type ActionRight = (typeof AMENDMENT_ACTION_RIGHTS)[number];

export const ACTION_RIGHTS: ActionRight[] = [...AMENDMENT_ACTION_RIGHTS];
