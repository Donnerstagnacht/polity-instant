import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Calendar } from 'lucide-react';

export interface GroupsCardProps {
  group: {
    id: number | string;
    groupId?: string; // Actual group ID for navigation
    abbr?: string;
    name: string;
    description?: string;
    role: string;
    members: number;
    amendments?: number;
    events?: number;
    tags?: string[];
  };
  badgeClasses?: string;
  gradientClass?: string;
}

export const GroupsCard: React.FC<GroupsCardProps> = ({
  group,
  badgeClasses = 'bg-primary/10 text-primary',
  gradientClass = 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/50',
}) => (
  <Card
    className={`overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${gradientClass}`}
  >
    <CardHeader className="space-y-3 pb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {group.abbr && (
            <Badge variant="secondary" className="mb-2 w-fit font-semibold">
              {group.abbr}
            </Badge>
          )}
          <CardTitle className="line-clamp-1 text-xl">{group.name}</CardTitle>
          <CardDescription className="mt-1.5 line-clamp-2">{group.description}</CardDescription>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Badge className={`${badgeClasses} hover:${badgeClasses} shadow-sm`}>{group.role}</Badge>
      </div>
    </CardHeader>

    <CardContent className="space-y-3 pt-0">
      {/* Stats row */}
      <div className="flex flex-wrap gap-3 border-t border-border/50 pt-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-medium">{group.members}</span>
        </div>
        {group.amendments !== undefined && group.amendments > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="font-medium">{group.amendments}</span>
          </div>
        )}
        {group.events !== undefined && group.events > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{group.events}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {group.tags && group.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {group.tags.map((tag, idx) => (
            <Badge
              key={`${group.id}-tag-${idx}-${tag}`}
              variant="outline"
              className="text-xs font-normal"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
