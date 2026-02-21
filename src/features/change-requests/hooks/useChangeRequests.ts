import { useMemo } from 'react';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { extractSuggestionContent } from '../utils/suggestion-extraction';

export interface ChangeRequest {
  id: string;
  crId: string;
  crNumber: number;
  title: string;
  description: string;
  type: string;
  text: string;
  newText: string;
  properties: Record<string, any>;
  newProperties: Record<string, any>;
  proposedChange: string;
  justification: string;
  isResolved: boolean;
  status: string;
  resolution: string | null;
  resolvedAt: number | null;
  resolvedBy: string | null;
  createdAt: number;
  userId: string;
  comments: any[];
  votes: any[];
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
        ...((amendment.discussions as any[])
          .filter((discussion: any) => !!discussion.crId)
          .map((suggestion: any) => {
            const suggestionContent = extractSuggestionContent(
              suggestion.id,
              document?.content as any[] ?? []
            );

            const matchingChangeRequest = savedChangeRequests.find(
              (cr: any) => cr.title === suggestion.crId
            );

            return {
              id: suggestion.id,
              crId: suggestion.crId,
              crNumber: parseInt(suggestion.crId?.replace('CR-', '') || '0'),
              title: suggestion.title || suggestion.crId,
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
              createdAt: suggestion.createdAt,
              userId: suggestion.userId,
              comments: suggestion.comments || [],
              votes: (matchingChangeRequest?.votes || []) as any[],
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
          .filter((cr: any) => {
            if (openRequestCrIds.has(cr.title)) {
              return false;
            }
            return cr.status === 'accepted' || cr.status === 'rejected';
          })
          .map((cr: any) => ({
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
    () => Array.from(new Set(changeRequests.map((cr: any) => cr.userId).filter(Boolean))),
    [changeRequests]
  );

  // Fetch users for all creators from facade
  const { allUsers: usersResults } = useAmendmentState({
    includeAllUsers: userIds.length > 0,
  });

  // Create a map of userId to user
  const users = useMemo(() => {
    const map: Record<string, any> = {};
    if (usersResults) {
      usersResults.forEach((user: any) => {
        if (user?.id) {
          map[user.id] = user;
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
