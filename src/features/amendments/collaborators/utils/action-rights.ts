/**
 * Action rights definitions for amendment collaborators
 */

export interface ActionRight {
  resource: string;
  action: string;
  label: string;
}

export const ACTION_RIGHTS: ActionRight[] = [
  { resource: 'amendments', action: 'update', label: 'Update Amendment' },
  { resource: 'amendments', action: 'delete', label: 'Delete Amendment' },
  { resource: 'documents', action: 'view', label: 'View Document' },
  { resource: 'documents', action: 'update', label: 'Edit Document' },
  { resource: 'threads', action: 'create', label: 'Create Threads' },
  { resource: 'threads', action: 'update', label: 'Update Threads' },
  { resource: 'threads', action: 'delete', label: 'Delete Threads' },
  { resource: 'comments', action: 'create', label: 'Create Comments' },
  { resource: 'comments', action: 'update', label: 'Update Comments' },
  { resource: 'comments', action: 'delete', label: 'Delete Comments' },
  { resource: 'notifications', action: 'manageNotifications', label: 'Manage Notifications' },
];
