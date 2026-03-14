import { useMemo } from 'react';
import type { Value } from 'platejs';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { extractSuggestionContent } from '../utils/suggestion-extraction';

/** Shape of entries in the amendment's `discussions` JSON column */
interface DiscussionEntry {
  id: string;
  crId?: string;
  title?: string;
  description?: string;
  justification?: string;
  createdAt?: number;
  userId?: string;
  comments?: readonly { text?: string; value?: string; userId?: string }[];
}

export interface ChangeRequest {
  id: string;
  crId: string;
  crNumber: number;
  title: string;
  description: string;
  type: string;
  text: string;
  newText: string;
  properties: Record<string, unknown>;
  newProperties: Record<string, unknown>;
  proposedChange: string;
  justification: string;
  isResolved: boolean;
  status: string;
  resolution: string | null;
  resolvedAt: number | null;
  resolvedBy: string | null;
  createdAt: number;
  userId: string;
  comments: readonly { text?: string; value?: string; userId?: string }[];
  votes: readonly {
    id: string;
    vote?: string | null;
    user_id?: string;
    created_at?: number;
    user?: { id: string; first_name?: string | null; last_name?: string | null; avatar?: string | null } | null;
  }[];
  changeRequestEntityId?: string;
}

export function useChangeRequests(amendmentId: string) {
  // Fetch amendment data using hook
  const {
    amendment,
    changeRequests: savedChangeRequests,
    collaborators,
    isLoading: amendmentLoading,
  } = useAmendmentState({ amendmentId });

  // Fetch document and users via facade
  const {
    documents: docResults,
    isLoading: facadeLoading,
  } = useAmendmentState({
    amendmentId,
    includeDocuments: true,
  });

  const document = docResults?.[0];

  // Extract change requests from discussions and saved entities
  const changeRequests = useMemo<ChangeRequest[]>(() => {
    const openRequests: ChangeRequest[] = [];
    const closedRequests: ChangeRequest[] = [];

    // Process open change requests from amendment.discussions
    if (amendment?.discussions && Array.isArray(amendment.discussions)) {
      openRequests.push(
        ...((amendment.discussions as readonly DiscussionEntry[])
          .filter((discussion) => !!discussion.crId)
          .map((suggestion) => {
            const suggestionContent = extractSuggestionContent(
              suggestion.id,
              document?.content as Value | undefined
            );

            const matchingChangeRequest = savedChangeRequests.find(
              (cr) => cr.title === suggestion.crId
            );

            return {
              id: suggestion.id,
              crId: suggestion.crId ?? '',
              crNumber: parseInt(suggestion.crId?.replace('CR-', '') || '0'),
              title: suggestion.title || suggestion.crId || '',
              description: suggestion.description || '',
              type: suggestionContent.type,
              text: suggestionContent.text,
              newText: suggestionContent.newText,
              properties: suggestionContent.properties,
              newProperties: suggestionContent.newProperties,
              proposedChange: suggestionContent.newText || suggestionContent.text,
              justification: suggestion.justification || '',
              isResolved: false,
              status: matchingChangeRequest?.status || 'open',
              resolution: null,
              resolvedAt: null,
              resolvedBy: null,
              createdAt: suggestion.createdAt ?? 0,
              userId: suggestion.userId ?? '',
              comments: suggestion.comments || [],
              votes: matchingChangeRequest?.votes || [],
              changeRequestEntityId: matchingChangeRequest?.id,
            } as ChangeRequest;
          })
        )
      );
    }

    // Process closed change requests from savedChangeRequests entity
    if (savedChangeRequests && Array.isArray(savedChangeRequests)) {
      const openRequestCrIds = new Set(openRequests.map(r => r.crId));

      closedRequests.push(
        ...savedChangeRequests
          .filter((cr) => {
            if (openRequestCrIds.has(cr.title)) {
              return false;
            }
            return cr.status === 'accepted' || cr.status === 'rejected';
          })
          .map((cr) => ({
            id: cr.id,
            crId: cr.title,
            crNumber: parseInt(cr.title?.replace('CR-', '') || '0'),
            title: cr.title,
            description: cr.description || '',
            type: 'unknown',
            text: cr.proposedChange || '',
            newText: '',
            properties: {},
            newProperties: {},
            proposedChange: cr.proposedChange || '',
            justification: cr.justification || '',
            isResolved: true,
            status: cr.status,
            resolution: cr.status,
            resolvedAt: cr.updatedAt,
            resolvedBy: cr.creator?.id,
            createdAt: cr.createdAt,
            userId: cr.creator?.id,
            comments: [],
            votes: cr.votes || [],
          }))
      );
    }

    // Combine and sort by CR number
    return [...openRequests, ...closedRequests].sort((a, b) => a.crNumber - b.crNumber);
  }, [amendment?.discussions, document?.content, savedChangeRequests]);

  // Separate open and closed requests
  const openChangeRequests = useMemo(
    () => changeRequests.filter(req => !req.isResolved),
    [changeRequests]
  );

  const closedChangeRequests = useMemo(
    () => changeRequests.filter(req => req.isResolved),
    [changeRequests]
  );

  // Get unique user IDs from change requests
  const userIds = useMemo(
    () => Array.from(new Set(changeRequests.map((cr) => cr.userId).filter(Boolean))),
    [changeRequests]
  );

  // Fetch users for all creators from facade
  const { allUsers: usersResults } = useAmendmentState({
    includeAllUsers: userIds.length > 0,
  });

  // Create a map of userId to user
  const users = useMemo(() => {
    const map: Record<string, { name: string }> = {};
    if (usersResults) {
      usersResults.forEach((user) => {
        if (user?.id) {
          map[user.id] = {
            name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.handle || 'Unknown',
          };
        }
      });
    }
    return map;
  }, [usersResults]);

  const isLoading = amendmentLoading || facadeLoading;

  return {
    amendment,
    document,
    changeRequests,
    openChangeRequests,
    closedChangeRequests,
    users,
    collaborators,
    isLoading,
  };
}
