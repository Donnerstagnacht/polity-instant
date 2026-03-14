'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Label } from '@/features/shared/ui/ui/label';
import { Input } from '@/features/shared/ui/ui/input';
import { TypeaheadSearch } from '@/features/shared/ui/typeahead/TypeaheadSearch';
import { toTypeaheadItems } from '@/features/shared/ui/typeahead/toTypeaheadItems';
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers';
import { ScrollArea } from '@/features/shared/ui/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/ui/dialog';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { findShortestPath } from '@/features/amendments/logic/path-finding.ts';
import { CalendarIcon, Target, User, MapPin, Clock, Users, ChevronRight, Search } from 'lucide-react';

interface TargetGroupEventSelectorProps {
  userId: string;
  collaborators?: Array<{ id: string; name?: string; email?: string; avatar?: string }>;
  onSelect: (data: {
    groupId: string;
    groupData: Record<string, unknown>;
    eventId: string;
    eventData: Record<string, unknown>;
    pathWithEvents: Array<{ groupId: string; groupName: string; eventId: string | null; eventTitle: string; eventStartDate: number | null }>;
    selectedUserId: string;
  }) => void;
  selectedGroupId?: string;
  selectedEventId?: string;
}

export function TargetGroupEventSelector({
  userId,
  collaborators = [],
  onSelect,
  selectedGroupId,
  selectedEventId,
}: TargetGroupEventSelectorProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(userId);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; data: Record<string, unknown> } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; data: Record<string, unknown> } | null>(null);
  const [eventSearchQuery, setEventSearchQuery] = useState<string>('');

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

  const groupEventsData = { events: groupEventsResult ?? [] };

  // Reset selection when user changes
  useEffect(() => {
    setSelectedGroup(null);
    setEventSearchQuery('');
    setSelectedEvent(null);
  }, [selectedUserId]);

  // Notify parent when selection is complete
  useEffect(() => {
    if (selectedGroup && selectedEvent) {
      const pathWithEvents = calculatePathWithEvents(selectedGroup.id);
      if (pathWithEvents) {
        // Override the last segment's event with the user-selected event
        const lastSegment = pathWithEvents[pathWithEvents.length - 1];
        if (lastSegment && lastSegment.groupId === selectedGroup.id) {
          lastSegment.eventId = selectedEvent.id;
          lastSegment.eventTitle = String(selectedEvent.data.title ?? '');
          lastSegment.eventStartDate = (selectedEvent.data.start_date as number) ?? null;
        }

        onSelect({
          groupId: selectedGroup.id,
          groupData: selectedGroup.data,
          eventId: selectedEvent.id,
          eventData: selectedEvent.data,
          pathWithEvents,
          selectedUserId,
        });
      }
    }
  }, [selectedGroup, selectedEvent, selectedUserId]);

  // Calculate path from user to target group with events for each step
  const calculatePathWithEvents = (targetGroupId: string) => {
    if (!networkData) return null;

    const currentUserId = selectedUserId || userId;
    const userMemberships = networkData.groupMemberships.filter(
      (m) =>
        (m.status === 'active' || m.status === 'admin') && m.user?.id === currentUserId
    );

    const userGroupIds = userMemberships.map((m) => m.group?.id).filter((id): id is string => !!id);
    const groups = networkData.groups;
    const relationships = networkData.groupRelationships;
    const events = networkData.events;

    // Filter for amendmentRight relationships and map to findShortestPath interface
    const amendmentRelationships = relationships
      .filter((r) => r.with_right === 'amendmentRight')
      .map((r) => ({
        id: r.id,
        parentGroup: { id: r.group?.id ?? '', name: r.group?.name ?? '' },
        childGroup: { id: r.related_group?.id ?? '', name: r.related_group?.name ?? '' },
        withRight: r.with_right ?? '',
      }));

    // Build groups map
    const groupsMap = new Map();
    groups.forEach((g) => {
      groupsMap.set(g.id, {
        id: g.id,
        name: g.name,
        description: g.description,
      });
    });

    // Find shortest path
    const path = findShortestPath(userGroupIds, targetGroupId, amendmentRelationships, groupsMap);

    if (!path) return null;

    // For each group in path, find the closest upcoming event
    const now = new Date();
    const pathWithEvents = path.map((segment) => {
      const groupId = segment.group.id;
      const groupName = segment.group.name;

      // Find all upcoming events for this group
      const groupEvents = events.filter(
        (e) => e.group?.id === groupId && new Date(e.start_date ?? 0) > now
      );

      // Sort by start date and pick the closest one
      groupEvents.sort(
        (a, b) => new Date(a.start_date ?? 0).getTime() - new Date(b.start_date ?? 0).getTime()
      );

      const closestEvent = groupEvents[0];

      return {
        groupId,
        groupName,
        eventId: closestEvent?.id || null,
        eventTitle: closestEvent?.title || 'No upcoming event',
        eventStartDate: closestEvent?.start_date || null,
      };
    });

    return pathWithEvents;
  };

  // Get connected groups for the selected user
  const getConnectedGroups = () => {
    if (!networkData) return [];

    const currentUserId = selectedUserId || userId;
    const userMemberships = networkData.groupMemberships.filter(
      (m) =>
        (m.status === 'active' || m.status === 'admin') && m.user?.id === currentUserId
    );

    const userGroupIds = userMemberships.map((m) => m.group?.id).filter((id): id is string => !!id);
    const allGroups = networkData.groups;
    const relationships = networkData.groupRelationships;

    // Filter for amendmentRight relationships
    const amendmentRelationships = relationships.filter(
      (r) => r.with_right === 'amendmentRight'
    );

    // Build set of connected groups (direct and indirect)
    const connectedGroupIds = new Set<string>(userGroupIds);

    // Add directly connected groups
    amendmentRelationships.forEach((rel) => {
      if (userGroupIds.includes(rel.group?.id ?? '')) {
        if (rel.related_group?.id) connectedGroupIds.add(rel.related_group.id);
      }
      if (userGroupIds.includes(rel.related_group?.id ?? '')) {
        if (rel.group?.id) connectedGroupIds.add(rel.group.id);
      }
    });

    // Add indirectly connected groups (2 hops)
    const firstHopGroups = Array.from(connectedGroupIds);
    amendmentRelationships.forEach((rel) => {
      if (firstHopGroups.includes(rel.group?.id ?? '')) {
        if (rel.related_group?.id) connectedGroupIds.add(rel.related_group.id);
      }
      if (firstHopGroups.includes(rel.related_group?.id ?? '')) {
        if (rel.group?.id) connectedGroupIds.add(rel.group.id);
      }
    });

    return allGroups.filter((g) => connectedGroupIds.has(g.id));
  };

  const connectedGroups = getConnectedGroups();
  const userMemberships = networkData.groupMemberships.filter(
    (m) =>
      (m.status === 'active' || m.status === 'admin') && m.user?.id === (selectedUserId || userId)
  );
  const userGroupIds = userMemberships.map((m) => m.group?.id).filter((id): id is string => !!id);

  // Get upcoming events for selected group
  const upcomingEvents =
    selectedGroup?.id && groupEventsData
      ? [...groupEventsData.events]
          .filter((e) => new Date(e.start_date ?? 0) > new Date())
          .sort(
            (a, b) =>
              new Date(a.start_date ?? 0).getTime() - new Date(b.start_date ?? 0).getTime()
          )
      : [];

  // Filter events based on search query
  const filteredEvents = upcomingEvents.filter((event) => {
    if (!eventSearchQuery.trim()) return true;
    
    const searchLower = eventSearchQuery.toLowerCase();
    const titleMatch = event.title?.toLowerCase().includes(searchLower);
    const descriptionMatch = event.description?.toLowerCase().includes(searchLower);
    const locationMatch = event.location_name?.toLowerCase().includes(searchLower);
    
    return titleMatch || descriptionMatch || locationMatch;
  });

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
          />
        )}
      </div>

      {/* Event Selection (shown after group is selected) */}
      {selectedGroup && (
        <div className="space-y-2">
          <Label>Select Target Event</Label>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming events for this group
            </p>
          ) : (
            <div className="space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search events by title, description, or location..."
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Events List */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredEvents.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No events match your search
                    </p>
                  ) : (
                    filteredEvents.map((event) => {
                      const isEventSelected = selectedEvent?.id === event.id;
                      
                      return (
                        <div
                          key={event.id}
                          className={`cursor-pointer rounded-lg border-2 bg-gradient-to-br from-green-100 to-blue-100 p-4 transition-all dark:from-green-900/40 dark:to-blue-900/50 ${
                            isEventSelected
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-border hover:border-primary hover:shadow-md'
                          }`}
                          onClick={() => {
                            setSelectedEvent({ id: event.id, data: event });
                          }}
                        >
                          {/* Header with title and badges */}
                          <div className="mb-3 flex items-start justify-between gap-2">
                            <h4 className="flex-1 text-lg font-semibold leading-tight">
                              {event.title}
                            </h4>
                            <div className="flex gap-1">
                              {isEventSelected && (
                                <Badge variant="default" className="text-xs">
                                  Selected
                                </Badge>
                              )}
                              {event.is_public && (
                                <Badge variant="outline" className="text-xs">
                                  Public
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Event details */}
                          <div className="space-y-1.5 text-xs text-muted-foreground">
                            {/* Date and time */}
                            {event.start_date && (
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <CalendarIcon className="h-3.5 w-3.5" />
                                  <span>
                                    {new Date(event.start_date).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>
                                    {new Date(event.start_date).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Location */}
                            {event.location_name && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate">{event.location_name}</span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {event.description && (
                            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface DisplayGroupData {
  abbr?: string | null;
  name?: string | null;
  description?: string | null;
  member_count?: number;
}

interface DisplayEventData {
  title?: string | null;
  is_public?: boolean;
  start_date?: number | null;
  location_name?: string | null;
  description?: string | null;
}

interface TargetGroupEventDisplayProps {
  groupData: DisplayGroupData;
  eventData: DisplayEventData;
  pathWithEvents?: Array<{ groupId: string; groupName: string; eventId: string | null; eventTitle: string; eventStartDate: number | null }>;
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
        <Card className="overflow-hidden border-2 bg-gradient-to-br from-blue-100 to-purple-100 transition-all duration-300 dark:from-blue-900/40 dark:to-purple-900/50">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {groupData.abbr && (
                  <Badge variant="secondary" className="mb-2 w-fit font-semibold">
                    {groupData.abbr}
                  </Badge>
                )}
                <CardTitle className="line-clamp-1 text-xl">{groupData.name ?? ''}</CardTitle>
                {groupData.description && (
                  <CardDescription className="mt-1.5 line-clamp-2">
                    {groupData.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex flex-wrap gap-3 border-t border-border/50 pt-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">{groupData.member_count ?? 0} members</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Card */}
      <div>
        <h4 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
          Target Event
        </h4>
        <div className="rounded-lg border-2 bg-gradient-to-br from-green-100 to-blue-100 p-4 dark:from-green-900/40 dark:to-blue-900/50">
          <div className="mb-3 flex items-start justify-between gap-2">
            <h4 className="flex-1 text-lg font-semibold leading-tight">{eventData.title ?? ''}</h4>
            <div className="flex gap-1">
              {eventData.is_public && (
                <Badge variant="outline" className="text-xs">
                  Public
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            {eventData.start_date && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>
                    {new Date(eventData.start_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {new Date(eventData.start_date).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )}

            {eventData.location_name && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{eventData.location_name}</span>
              </div>
            )}
          </div>

          {eventData.description && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {eventData.description}
            </p>
          )}
        </div>
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
