'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Label } from '@/features/shared/ui/ui/label';
import { TypeaheadSearch } from '@/features/shared/ui/typeahead/TypeaheadSearch';
import { toTypeaheadItems } from '@/features/shared/ui/typeahead/toTypeaheadItems';
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import {
  type AmendmentNetworkEvent,
  type AmendmentNetworkGroup,
  type PathWithEventSegment,
  calculateUpwardPathWithClosestEvents,
  getActiveUserGroupIds,
  getUpwardConnectedGroupsForUser,
} from '@/features/amendments/logic/amendmentPathHelpers';
import { Target, User, ChevronRight } from 'lucide-react';
import { GroupTimelineCard } from '@/features/timeline/ui/cards/GroupTimelineCard';
import { EventTimelineCard } from '@/features/timeline/ui/cards/EventTimelineCard';

interface TargetGroupEventSelectorProps {
  userId: string;
  collaborators?: Array<{ id: string; name?: string; email?: string; avatar?: string }>;
  onSelect: (data: {
    groupId: string;
    groupData: AmendmentNetworkGroup;
    eventId: string;
    eventData: AmendmentNetworkEvent;
    pathWithEvents: PathWithEventSegment[];
    selectedUserId: string;
  }) => void;
  selectedGroupId?: string;
  selectedEventId?: string;
  /** Pass true when rendered inside a Dialog to avoid portal/focus-trap conflicts */
  disablePortal?: boolean;
}

export function TargetGroupEventSelector({
  userId,
  collaborators = [],
  onSelect,
  selectedGroupId,
  selectedEventId,
  disablePortal = false,
}: TargetGroupEventSelectorProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(userId);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; data: AmendmentNetworkGroup } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; data: AmendmentNetworkEvent } | null>(null);
  const [pathWithEvents, setPathWithEvents] = useState<PathWithEventSegment[]>([]);
  const [pathValidationError, setPathValidationError] = useState<string | null>(null);
  const lastEmittedSelectionRef = useRef<string | null>(null);

  // Fetch network data via facade
  const {
    allGroups: groups,
    allGroupRelationships: groupRelationshipsData,
    allGroupMemberships: groupMembershipsData,
    allEvents: eventsData,
    eventsByGroup: groupEventsResult,
  } = useAmendmentState({
    includeNetworkData: true,
    includeEventsByGroup: !!selectedGroup?.id,
    eventGroupId: selectedGroup?.id,
  });

  const networkData = {
    groups: groups ?? [],
    groupRelationships: groupRelationshipsData ?? [],
    groupMemberships: groupMembershipsData ?? [],
    events: eventsData ?? [],
  };

  // Reset selection when user changes
  useEffect(() => {
    setSelectedGroup(null);
    setSelectedEvent(null);
    setPathWithEvents([]);
    setPathValidationError(null);
    lastEmittedSelectionRef.current = null;
  }, [selectedUserId]);

  // Seed the computed path when user picks target group/event.
  useEffect(() => {
    if (!selectedGroup || !selectedEvent) {
      setPathWithEvents([]);
      lastEmittedSelectionRef.current = null;
      return;
    }

    const calculatedPath = calculatePathWithEvents(selectedGroup.id);
    if (!calculatedPath) {
      setPathWithEvents([]);
      return;
    }

    const seededPath = calculatedPath.map((segment) =>
      segment.groupId === selectedGroup.id
        ? {
            ...segment,
            eventId: selectedEvent.id,
            eventTitle: String(selectedEvent.data.title ?? ''),
            eventStartDate: selectedEvent.data.start_date ?? null,
          }
        : segment
    );

    setPathWithEvents(seededPath);
  }, [selectedGroup, selectedEvent, selectedUserId, eventsData]);

  // Calculate path from user to target group with events for each step
  const calculatePathWithEvents = (targetGroupId: string) => {
    if (!networkData) return null;

    const currentUserId = selectedUserId || userId;
    const userGroupIds = getActiveUserGroupIds(networkData.groupMemberships, currentUserId);

    return calculateUpwardPathWithClosestEvents({
      userGroupIds,
      targetGroupId,
      groups: networkData.groups,
      relationships: networkData.groupRelationships,
      events: networkData.events,
    });
  };

  // Get connected groups for the selected user
  const getConnectedGroups = () => {
    if (!networkData) return [];

    const currentUserId = selectedUserId || userId;
    const userGroupIds = getActiveUserGroupIds(networkData.groupMemberships, currentUserId);

    return getUpwardConnectedGroupsForUser(
      userGroupIds,
      networkData.groups,
      networkData.groupRelationships
    );
  };

  const connectedGroups = getConnectedGroups();
  const userGroupIds = getActiveUserGroupIds(
    networkData.groupMemberships,
    selectedUserId || userId
  );

  const getUpcomingEventsForGroup = useCallback(
    (groupId: string): AmendmentNetworkEvent[] => {
      const now = Date.now();
      return [...(networkData.events ?? [])]
        .filter((event) => event.group_id === groupId && (event.start_date ?? 0) > now)
        .sort((a, b) => (a.start_date ?? 0) - (b.start_date ?? 0));
    },
    [networkData.events]
  );

  // Get events for selected group from the dedicated eventsByGroup query
  // Shows all events (upcoming first, then past) so users can always see available events
  const upcomingEvents = selectedGroup?.id
    ? [...(groupEventsResult ?? [])]
        .sort((a, b) => {
          const now = Date.now();
          const aFuture = (a.start_date ?? 0) > now;
          const bFuture = (b.start_date ?? 0) > now;
          if (aFuture && !bFuture) return -1;
          if (!aFuture && bFuture) return 1;
          return (a.start_date ?? 0) - (b.start_date ?? 0);
        })
    : [];

  const targetEventItems = useMemo(
    () =>
      toTypeaheadItems(
        upcomingEvents,
        'event',
        (event) => event.title || 'Event',
        (event) => {
          const dateLabel = event.start_date
            ? new Date(event.start_date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })
            : 'No date';

          return event.location_name
            ? `${dateLabel} - ${event.location_name}`
            : dateLabel;
        }
      ),
    [upcomingEvents]
  );

  const validatePathEventOrder = useCallback((segments: PathWithEventSegment[]): string | null => {
    if (segments.some((segment) => !segment.eventId)) {
      return 'Please select an event for each group in the amendment path.';
    }

    for (let index = 1; index < segments.length; index++) {
      const previous = segments[index - 1];
      const current = segments[index];

      if (
        previous?.eventStartDate &&
        current?.eventStartDate &&
        previous.eventStartDate > current.eventStartDate
      ) {
        return 'Events of lower groups must be before events of higher groups.';
      }
    }

    return null;
  }, []);

  const updatePathSegmentEvent = useCallback(
    (groupId: string, item: TypeaheadItem | null) => {
      if (!item) return;

      // For the target group, search upcomingEvents (from groupEventsResult) first
      const event =
        (groupId === selectedGroup?.id
          ? upcomingEvents.find((entry) => entry.id === item.id)
          : undefined) ??
        getUpcomingEventsForGroup(groupId).find((entry) => entry.id === item.id);
      if (!event) return;

      setPathWithEvents((previous) =>
        previous.map((segment) =>
          segment.groupId === groupId
            ? {
                ...segment,
                eventId: event.id,
                eventTitle: String(event.title ?? ''),
                eventStartDate: event.start_date ?? null,
              }
            : segment
        )
      );

      if (selectedGroup?.id === groupId) {
        setSelectedEvent({ id: event.id, data: event });
      }
    },
    [getUpcomingEventsForGroup, selectedGroup?.id, upcomingEvents]
  );

  useEffect(() => {
    if (!selectedGroup || !selectedEvent || pathWithEvents.length === 0) {
      setPathValidationError(null);
      return;
    }

    const validationError = validatePathEventOrder(pathWithEvents);
    setPathValidationError(validationError);
    if (validationError) {
      lastEmittedSelectionRef.current = null;
      return;
    }

    const targetSegment = pathWithEvents.find((segment) => segment.groupId === selectedGroup.id);
    const targetEventId = targetSegment?.eventId ?? selectedEvent.id;
    const targetEvent =
      getUpcomingEventsForGroup(selectedGroup.id).find((event) => event.id === targetEventId) ??
      selectedEvent.data;

    const selectionSignature = JSON.stringify({
      groupId: selectedGroup.id,
      eventId: targetEventId,
      selectedUserId,
      pathWithEvents: pathWithEvents.map((segment) => ({
        groupId: segment.groupId,
        eventId: segment.eventId,
        eventStartDate: segment.eventStartDate,
      })),
    });

    if (lastEmittedSelectionRef.current === selectionSignature) {
      return;
    }

    lastEmittedSelectionRef.current = selectionSignature;

    onSelect({
      groupId: selectedGroup.id,
      groupData: selectedGroup.data,
      eventId: targetEventId,
      eventData: targetEvent,
      pathWithEvents,
      selectedUserId,
    });
  }, [
    getUpcomingEventsForGroup,
    onSelect,
    pathWithEvents,
    selectedEvent,
    selectedGroup,
    selectedUserId,
    validatePathEventOrder,
  ]);

  return (
    <div className="space-y-4">
      {/* User Selection (if collaborators are provided) */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <TypeaheadSearch
              items={toTypeaheadItems(
                collaborators,
                'user',
                (u) => u.name || 'User',
                (u) => u.email,
                (u) => u.avatar,
              )}
              value={selectedUserId}
              onChange={(item: TypeaheadItem | null) => setSelectedUserId(item?.id ?? '')}
              placeholder="Select collaborator to view their network..."
              label="Select Network For:"
              disablePortal={disablePortal}
            />
          </div>
        </div>
      )}

      {/* Group Selection with TypeAhead */}
      <div className="space-y-2">
        <Label>Select Target Group</Label>
        {connectedGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No connected groups found. You need to be a member of groups with amendment rights.
          </p>
        ) : (
          <TypeaheadSearch
            items={toTypeaheadItems(
              connectedGroups,
              'group',
              (g) => g.name || 'Group',
              (g) => g.description?.substring(0, 60),
            )}
            value={selectedGroup?.id || ''}
            onChange={(item: TypeaheadItem | null) => {
              if (item) {
                const group = connectedGroups.find((g) => g.id === item.id);
                if (group) {
                  setSelectedGroup({ id: group.id, data: group });
                  setSelectedEvent(null);
                }
              }
            }}
            placeholder="Search for a group..."
            disablePortal={disablePortal}
          />
        )}
      </div>

      {/* Event Selection (shown after group is selected) */}
      {selectedGroup && (
        <div className="space-y-2">
          <Label>Select Target Event</Label>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No events found for this group
            </p>
          ) : (
            <TypeaheadSearch
              items={targetEventItems}
              value={selectedEvent?.id || ''}
              onChange={(item: TypeaheadItem | null) => {
                if (!item) {
                  setSelectedEvent(null);
                  return;
                }

                const event = upcomingEvents.find((entry) => entry.id === item.id);
                if (event) {
                  setSelectedEvent({ id: event.id, data: event });
                }
              }}
              placeholder="Search for an event..."
              disablePortal={disablePortal}
            />
          )}
        </div>
      )}

      {pathWithEvents.length > 0 && (
        <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm">Amendment path events</Label>
          </div>

          <p className="text-xs text-muted-foreground">
            Select one event per group. Events of lower groups must happen before events of higher groups.
          </p>

          <div className="space-y-3">
            {pathWithEvents.map((segment, index) => {
              // For the target group, use the same event list as the main typeahead
              // (groupEventsResult includes past events), avoiding the "no upcoming events" mismatch
              const segmentEvents = segment.groupId === selectedGroup?.id
                ? upcomingEvents
                : getUpcomingEventsForGroup(segment.groupId);

              return (
                <div key={segment.groupId} className="rounded-md border border-border bg-background p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{segment.groupName}</p>
                    <Badge variant="secondary" className="text-xs">Step {index + 1}</Badge>
                  </div>

                  {segmentEvents.length > 0 ? (
                    <TypeaheadSearch
                      items={toTypeaheadItems(
                        segmentEvents,
                        'event',
                        (event) => event.title || 'Event',
                        (event) =>
                          event.start_date
                            ? new Date(event.start_date).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            : 'No date'
                      )}
                      value={segment.eventId ?? undefined}
                      onChange={(item: TypeaheadItem | null) => updatePathSegmentEvent(segment.groupId, item)}
                      placeholder="Select an event for this group..."
                      disablePortal={disablePortal}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No upcoming events available for this group.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {pathValidationError && (
            <p className="text-xs text-destructive">{pathValidationError}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface DisplayGroupData {
  id: string;
  abbr?: string | null;
  name?: string | null;
  description?: string | null;
  member_count?: number | null;
  event_count?: number | null;
  amendment_count?: number | null;
}

interface DisplayEventData {
  id: string;
  title?: string | null;
  is_public?: boolean | null;
  start_date?: number | null;
  location_name?: string | null;
  description?: string | null;
  participant_count?: number | null;
}

interface TargetGroupEventDisplayProps {
  groupData: DisplayGroupData;
  eventData: DisplayEventData;
  pathWithEvents?: PathWithEventSegment[];
}

export function TargetGroupEventDisplay({
  groupData,
  eventData,
  pathWithEvents = [],
}: TargetGroupEventDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Group Card */}
      <div>
        <h4 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
          Target Group
        </h4>
        <GroupTimelineCard
          group={{
            id: groupData.id,
            name: groupData.name ?? '',
            description: groupData.description ?? undefined,
            memberCount: groupData.member_count ?? 0,
            eventCount: groupData.event_count ?? 0,
            amendmentCount: groupData.amendment_count ?? 0,
          }}
        />
      </div>

      {/* Event Card */}
      <div>
        <h4 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
          Target Event
        </h4>
        <EventTimelineCard
          event={{
            id: eventData.id,
            title: eventData.title ?? '',
            description: eventData.description ?? undefined,
            startDate: eventData.start_date ? new Date(eventData.start_date) : new Date(),
            location: eventData.location_name ?? undefined,
            attendeeCount: eventData.participant_count ?? 0,
          }}
        />
      </div>

      {/* Path Preview */}
      {pathWithEvents.length > 0 && (
        <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-semibold">Amendment Path ({pathWithEvents.length} groups):</p>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {pathWithEvents.map((segment, index) => (
              <div key={segment.groupId} className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {segment.groupName}
                </Badge>
                {index < pathWithEvents.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
