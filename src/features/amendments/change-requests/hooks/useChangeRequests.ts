import { useMemo } from 'react';
import db from '../../../../../db/db';
import { useAmendmentData } from '@/features/amendments/hooks/useAmendmentData';
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
  } = useAmendmentData(amendmentId);

  // Fetch document with discussions separately
  const { data: docData, isLoading: docLoading } = db.useQuery({
    documents: {
      $: { where: { 'amendment.id': amendmentId } },
    },
  });

  const document = docData?.documents?.[0];

  // Extract change requests from discussions and saved entities
  const changeRequests = useMemo<ChangeRequest[]>(() => {
    const openRequests: ChangeRequest[] = [];
    const closedRequests: ChangeRequest[] = [];

    // Process open change requests from document.discussions
    if (document?.discussions && Array.isArray(document.discussions)) {
      openRequests.push(
        ...document.discussions
          .filter((discussion: any) => !!discussion.crId)
          .map((suggestion: any) => {
            const suggestionContent = extractSuggestionContent(
              suggestion.id,
              document.content as any[]
            );

            // Check if a changeRequest entity exists for this discussion
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
              votes: matchingChangeRequest?.votes || [],
              changeRequestEntityId: matchingChangeRequest?.id,
            };
          })
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
  }, [document?.discussions, document?.content, savedChangeRequests]);

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

  // Fetch users for all creators
  const { data: usersData, isLoading: usersLoading } = db.useQuery(
    userIds.length > 0
      ? {
          $users: {
            $: {
              where: {
                id: { in: userIds },
              },
            },
          },
        }
      : { $users: {} }
  );

  // Create a map of userId to user
  const users = useMemo(() => {
    const map: Record<string, any> = {};
    if (usersData?.$users) {
      usersData.$users.forEach((user: any) => {
        if (user?.id) {
          map[user.id] = user;
        }
      });
    }
    return map;
  }, [usersData]);

  const isLoading = amendmentLoading || docLoading || usersLoading;

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
