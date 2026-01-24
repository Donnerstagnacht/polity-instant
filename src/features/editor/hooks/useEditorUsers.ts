/**
 * Unified Editor Users Hook
 *
 * Builds a users map for the PlateEditor from entity data.
 */

import { useMemo } from 'react';
import type { EditorEntity, EditorUser } from '../types';

interface EditorUserRecord {
  id: string;
  name: string;
  avatarUrl: string;
}

/**
 * Hook to build a users map for the PlateEditor
 *
 * @param entity - The editor entity
 * @param currentUser - The current user
 * @returns A map of user IDs to user records
 */
export function useEditorUsers(
  entity: EditorEntity | null,
  currentUser?: EditorUser
): Record<string, EditorUserRecord> {
  return useMemo(() => {
    const users: Record<string, EditorUserRecord> = {};

    // Add current user
    if (currentUser) {
      users[currentUser.id] = {
        id: currentUser.id,
        name: currentUser.name || 'Anonymous',
        avatarUrl:
          currentUser.avatarUrl || `https://api.dicebear.com/9.x/glass/svg?seed=${currentUser.id}`,
      };
    }

    if (!entity) return users;

    // Add owner
    if (entity.owner) {
      users[entity.owner.id] = {
        id: entity.owner.id,
        name: entity.owner.name || 'Owner',
        avatarUrl:
          entity.owner.avatarUrl ||
          `https://api.dicebear.com/9.x/glass/svg?seed=${entity.owner.id}`,
      };
    }

    // Add collaborators
    entity.collaborators.forEach(collab => {
      if (collab.user?.id && !users[collab.user.id]) {
        users[collab.user.id] = {
          id: collab.user.id,
          name: collab.user.name || 'Collaborator',
          avatarUrl:
            collab.user.avatarUrl ||
            `https://api.dicebear.com/9.x/glass/svg?seed=${collab.user.id}`,
        };
      }
    });

    return users;
  }, [entity, currentUser]);
}
