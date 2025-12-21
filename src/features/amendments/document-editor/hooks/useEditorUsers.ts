/**
 * Hook for building editor users map
 */

import { useMemo } from 'react';

interface User {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

interface Collaborator {
  id: string;
  user: User;
}

interface Document {
  owner?: User;
  collaborators?: Collaborator[];
}

export function useEditorUsers(currentUser: User | undefined, currentUserRecord: User | undefined, document: Document | undefined) {
  return useMemo(() => {
    const users: Record<string, { id: string; name: string; avatarUrl: string }> = {};

    // Add current user
    if (currentUser && currentUserRecord) {
      users[currentUser.id] = {
        id: currentUser.id,
        name: currentUserRecord.name || currentUser.email || 'Anonymous',
        avatarUrl: currentUserRecord.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${currentUser.id}`,
      };
    }

    // Add document owner
    if (document?.owner) {
      const owner = document.owner;
      users[owner.id] = {
        id: owner.id,
        name: owner?.name || owner.email || 'Owner',
        avatarUrl: owner?.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${owner.id}`,
      };
    }

    // Add all collaborators
    if (document?.collaborators) {
      document.collaborators.forEach((collab: Collaborator) => {
        const collabUser = collab.user;
        if (collabUser?.id) {
          users[collabUser.id] = {
            id: collabUser.id,
            name: collabUser?.name || collabUser.email || 'Collaborator',
            avatarUrl:
              collabUser?.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${collabUser.id}`,
          };
        }
      });
    }

    return users;
  }, [currentUser, currentUserRecord, document?.owner, document?.collaborators]);
}
