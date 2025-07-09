import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface GroupsCardProps {
  group: {
    id: number;
    abbr?: string;
    name: string;
    description?: string;
    role: string;
    members: number;
    amendments?: number;
    events?: number;
    tags?: string[];
  };
  badgeClasses: string;
}

export const GroupsCard: React.FC<GroupsCardProps> = ({ group, badgeClasses }) => (
  <Card
    key={group.id}
    className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
  >
    <CardHeader>
      {group.abbr && (
        <Badge variant="secondary" className="mb-2 w-fit">
          {group.abbr}
        </Badge>
      )}
      <CardTitle>{group.name}</CardTitle>
      <CardDescription>{group.description}</CardDescription>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge className={`${badgeClasses} hover:${badgeClasses}`}>{group.role}</Badge>
        <Badge className={`${badgeClasses} hover:${badgeClasses}`}>{group.members} members</Badge>
        {group.amendments && (
          <Badge className={`${badgeClasses} hover:${badgeClasses}`}>
            {group.amendments} amendments
          </Badge>
        )}
        {group.events && (
          <Badge className={`${badgeClasses} hover:${badgeClasses}`}>{group.events} events</Badge>
        )}
      </div>
    </CardHeader>
    <CardContent>
      {group.tags && group.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {group.tags.map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
