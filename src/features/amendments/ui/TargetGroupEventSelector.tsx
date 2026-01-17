'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TypeAheadSelect } from '@/components/ui/type-ahead-select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import db from '../../../../db/db';
import { findShortestPath } from '@/utils/path-finding';
import { CalendarIcon, Target, User, MapPin, Clock, Users, ChevronRight, Search } from 'lucide-react';

interface TargetGroupEventSelectorProps {
  userId: string;
  collaborators?: Array<{ id: string; name?: string; email?: string; avatar?: string }>;
  onSelect: (data: {
    groupId: string;
    groupData: any;
    eventId: string;
    eventData: any;
    pathWithEvents: any[];
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
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; data: any } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; data: any } | null>(null);
  const [eventSearchQuery, setEventSearchQuery] = useState<string>('');

  // Fetch network data
  const { data: networkData } = db.useQuery({
    groups: {},
    groupRelationships: {
      parentGroup: {},
      childGroup: {},
    },
    groupMemberships: {
      group: {},
      user: {},
    },
    events: {
      group: {},
    },
  } as any);

  // Query events for selected group
  const { data: groupEventsData } = db.useQuery(
    selectedGroup?.id
      ? {
          events: {
            $: {
              where: {
                'group.id': selectedGroup.id,
              },
            },
            group: {},
          },
        }
      : { events: {} }
  );

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
          lastSegment.eventTitle = selectedEvent.data.title;
          lastSegment.eventStartDate = selectedEvent.data.startDate;
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
    const userMemberships =
      (networkData as any)?.groupMemberships?.filter(
        (m: any) =>
          (m.status === 'member' || m.status === 'admin') && m.user?.id === currentUserId
      ) || [];

    const userGroupIds = userMemberships.map((m: any) => m.group.id);
    const allGroups = (networkData as any)?.groups || [];
    const relationships = (networkData as any)?.groupRelationships || [];
    const events = (networkData as any)?.events || [];

    // Filter for amendmentRight relationships
    const amendmentRelationships = relationships.filter(
      (r: any) => r.withRight === 'amendmentRight'
    );

    // Build groups map
    const groupsMap = new Map();
    allGroups.forEach((g: any) => {
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
    const pathWithEvents = path.map((segment: any) => {
      const groupId = segment.group.id;
      const groupName = segment.group.name;

      // Find all upcoming events for this group
      const groupEvents = events.filter(
        (e: any) => e.group?.id === groupId && new Date(e.startDate) > now
      );

      // Sort by start date and pick the closest one
      groupEvents.sort(
        (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      const closestEvent = groupEvents[0];

      return {
        groupId,
        groupName,
        eventId: closestEvent?.id || null,
        eventTitle: closestEvent?.title || 'No upcoming event',
        eventStartDate: closestEvent?.startDate || null,
      };
    });

    return pathWithEvents;
  };

  // Get connected groups for the selected user
  const getConnectedGroups = () => {
    if (!networkData) return [];

    const currentUserId = selectedUserId || userId;
    const userMemberships =
      (networkData as any)?.groupMemberships?.filter(
        (m: any) =>
          (m.status === 'member' || m.status === 'admin') && m.user?.id === currentUserId
      ) || [];

    const userGroupIds = userMemberships.map((m: any) => m.group.id);
    const allGroups = (networkData as any)?.groups || [];
    const relationships = (networkData as any)?.groupRelationships || [];

    // Filter for amendmentRight relationships
    const amendmentRelationships = relationships.filter(
      (r: any) => r.withRight === 'amendmentRight'
    );

    // Build set of connected groups (direct and indirect)
    const connectedGroupIds = new Set<string>(userGroupIds);

    // Add directly connected groups
    amendmentRelationships.forEach((rel: any) => {
      if (userGroupIds.includes(rel.parentGroup?.id)) {
        connectedGroupIds.add(rel.childGroup?.id);
      }
      if (userGroupIds.includes(rel.childGroup?.id)) {
        connectedGroupIds.add(rel.parentGroup?.id);
      }
    });

    // Add indirectly connected groups (2 hops)
    const firstHopGroups = Array.from(connectedGroupIds);
    amendmentRelationships.forEach((rel: any) => {
      if (firstHopGroups.includes(rel.parentGroup?.id)) {
        connectedGroupIds.add(rel.childGroup?.id);
      }
      if (firstHopGroups.includes(rel.childGroup?.id)) {
        connectedGroupIds.add(rel.parentGroup?.id);
      }
    });

    return allGroups.filter((g: any) => connectedGroupIds.has(g.id));
  };

  const connectedGroups = getConnectedGroups();
  const userMemberships =
    (networkData as any)?.groupMemberships?.filter(
      (m: any) =>
        (m.status === 'member' || m.status === 'admin') && m.user?.id === (selectedUserId || userId)
    ) || [];
  const userGroupIds = userMemberships.map((m: any) => m.group.id);

  // Get upcoming events for selected group
  const upcomingEvents =
    selectedGroup?.id && groupEventsData
      ? ((groupEventsData as any)?.events || [])
          .filter((e: any) => new Date(e.startDate) > new Date())
          .sort(
            (a: any, b: any) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
      : [];

  // Filter events based on search query
  const filteredEvents = upcomingEvents.filter((event: any) => {
    if (!eventSearchQuery.trim()) return true;
    
    const searchLower = eventSearchQuery.toLowerCase();
    const titleMatch = event.title?.toLowerCase().includes(searchLower);
    const descriptionMatch = event.description?.toLowerCase().includes(searchLower);
    const locationMatch = event.location?.toLowerCase().includes(searchLower);
    
    return titleMatch || descriptionMatch || locationMatch;
  });

  return (
    <div className="space-y-4">
      {/* User Selection (if collaborators are provided) */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <TypeAheadSelect
              items={collaborators}
              value={selectedUserId}
              onChange={setSelectedUserId}
              placeholder="Select collaborator to view their network..."
              searchKeys={['name', 'email']}
              getItemId={(user: any) => user.id}
              renderItem={(user: any) => (
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        ?.split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    {user.email && (
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    )}
                  </div>
                </div>
              )}
              renderSelected={(user: any) => (
                <div className="flex items-center justify-between rounded-md border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || undefined} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      {user.email && (
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
          <TypeAheadSelect
            items={connectedGroups}
            value={selectedGroup?.id || ''}
            onChange={(groupId: string) => {
              const group = connectedGroups.find((g: any) => g.id === groupId);
              if (group) {
                setSelectedGroup({ id: group.id, data: group });
                setSelectedEvent(null);
              }
            }}
            placeholder="Search for a group..."
            searchKeys={['name', 'description']}
            getItemId={(group: any) => group.id}
            renderItem={(group: any) => {
              const isMemberGroup = userGroupIds.includes(group.id);
              return (
                <Card className="overflow-hidden border-2 bg-gradient-to-br from-blue-100 to-purple-100 transition-all duration-300 dark:from-blue-900/40 dark:to-purple-900/50">
                  <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {group.abbr && (
                          <Badge variant="secondary" className="mb-2 w-fit font-semibold">
                            {group.abbr}
                          </Badge>
                        )}
                        <CardTitle className="line-clamp-1 text-lg">{group.name}</CardTitle>
                        {group.description && (
                          <CardDescription className="mt-1.5 line-clamp-2">
                            {group.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex flex-wrap gap-3 border-t border-border/50 pt-3">
                      {isMemberGroup && (
                        <Badge variant="secondary" className="text-xs">
                          Member
                        </Badge>
                      )}
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{group.memberCount || 0} members</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }}
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
                    filteredEvents.map((event: any) => {
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
                              {event.isPublic && (
                                <Badge variant="outline" className="text-xs">
                                  Public
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Event details */}
                          <div className="space-y-1.5 text-xs text-muted-foreground">
                            {/* Date and time */}
                            {event.startDate && (
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <CalendarIcon className="h-3.5 w-3.5" />
                                  <span>
                                    {new Date(event.startDate).toLocaleDateString('en-US', {
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
                                    {new Date(event.startDate).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Location */}
                            {event.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate">{event.location}</span>
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

interface TargetGroupEventDisplayProps {
  groupData: any;
  eventData: any;
  pathWithEvents?: any[];
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
                <CardTitle className="line-clamp-1 text-xl">{groupData.name}</CardTitle>
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
                <span className="font-medium">{groupData.memberCount || 0} members</span>
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
            <h4 className="flex-1 text-lg font-semibold leading-tight">{eventData.title}</h4>
            <div className="flex gap-1">
              {eventData.isPublic && (
                <Badge variant="outline" className="text-xs">
                  Public
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            {eventData.startDate && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>
                    {new Date(eventData.startDate).toLocaleDateString('en-US', {
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
                    {new Date(eventData.startDate).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )}

            {eventData.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{eventData.location}</span>
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
