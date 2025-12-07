'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Scale, FileText } from 'lucide-react';

// Event Selection Card
export function EventSelectCard({ event }: { event: any }) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{event.title}</CardTitle>
          <Badge variant="outline" className="flex-shrink-0">
            <Calendar className="mr-1 h-3 w-3" />
            Event
          </Badge>
        </div>
        {event.startDate && (
          <CardDescription className="text-xs">{formatDate(event.startDate)}</CardDescription>
        )}
      </CardHeader>
      {(event.location || event.group?.name) && (
        <CardContent className="pt-0">
          <div className="space-y-1 text-xs text-muted-foreground">
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            {event.group?.name && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="truncate">{event.group.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Group Selection Card
export function GroupSelectCard({ group }: { group: any }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{group.name}</CardTitle>
          <Badge variant="outline" className="flex-shrink-0">
            <Users className="mr-1 h-3 w-3" />
            Group
          </Badge>
        </div>
        {group.description && (
          <CardDescription className="line-clamp-2 text-xs">{group.description}</CardDescription>
        )}
      </CardHeader>
      {group.memberCount && (
        <CardContent className="pt-0">
          <div className="text-xs text-muted-foreground">
            {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Amendment Selection Card
export function AmendmentSelectCard({ amendment }: { amendment: any }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{amendment.title}</CardTitle>
          <Badge variant="outline" className="flex-shrink-0">
            <Scale className="mr-1 h-3 w-3" />
            Amendment
          </Badge>
        </div>
        {amendment.subtitle && (
          <CardDescription className="line-clamp-1 text-xs">{amendment.subtitle}</CardDescription>
        )}
      </CardHeader>
      {amendment.status && (
        <CardContent className="pt-0">
          <Badge variant="secondary" className="text-xs">
            {amendment.status}
          </Badge>
        </CardContent>
      )}
    </Card>
  );
}

// Election Selection Card
export function ElectionSelectCard({ election }: { election: any }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{election.title}</CardTitle>
          <Badge variant="outline" className="flex-shrink-0">
            Election
          </Badge>
        </div>
        {election.description && (
          <CardDescription className="line-clamp-2 text-xs">{election.description}</CardDescription>
        )}
      </CardHeader>
      {election.status && (
        <CardContent className="pt-0">
          <Badge variant="secondary" className="text-xs">
            {election.status}
          </Badge>
        </CardContent>
      )}
    </Card>
  );
}

// Position Selection Card
export function PositionSelectCard({ position }: { position: any }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{position.title}</CardTitle>
          <Badge variant="outline" className="flex-shrink-0">
            Position
          </Badge>
        </div>
        {position.description && (
          <CardDescription className="line-clamp-2 text-xs">{position.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {position.group?.name && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{position.group.name}</span>
            </div>
          )}
          {position.term && <span>{position.term} months</span>}
        </div>
      </CardContent>
    </Card>
  );
}

// Amendment Vote Selection Card (for change requests)
export function AmendmentVoteSelectCard({ amendmentVote }: { amendmentVote: any }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{amendmentVote.title}</CardTitle>
          <Badge variant="outline" className="flex-shrink-0">
            <FileText className="mr-1 h-3 w-3" />
            Vote
          </Badge>
        </div>
        {amendmentVote.description && (
          <CardDescription className="line-clamp-2 text-xs">
            {amendmentVote.description}
          </CardDescription>
        )}
      </CardHeader>
      {amendmentVote.status && (
        <CardContent className="pt-0">
          <Badge variant="secondary" className="text-xs">
            {amendmentVote.status}
          </Badge>
        </CardContent>
      )}
    </Card>
  );
}

// Agenda Item Selection Card (for elections/votes)
export function AgendaItemSelectCard({ agendaItem }: { agendaItem: any }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{agendaItem.title}</CardTitle>
          <Badge variant="outline" className="flex-shrink-0">
            {agendaItem.type}
          </Badge>
        </div>
        {agendaItem.event?.title && (
          <CardDescription className="text-xs">{agendaItem.event.title}</CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}
