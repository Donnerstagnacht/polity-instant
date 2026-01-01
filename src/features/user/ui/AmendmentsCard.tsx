import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface AmendmentsCardProps {
  amendment: {
    id: number;
    code?: string;
    title: string;
    subtitle?: string;
    status: string;
    supporters: number;
    date: string;
    tags?: string[];
    collaboratorsCount?: number;
    supportingGroupsCount?: number;
    supportingMembersCount?: number;
    collaborationRole?: string;
  };
  statusStyle: {
    badge: string;
    bgColor: string;
    textColor: string;
    badgeTextColor?: string;
  };
  gradientClass?: string;
}

export const AmendmentsCard: React.FC<AmendmentsCardProps> = ({
  amendment,
  statusStyle,
  gradientClass,
}) => (
  <Card
    key={amendment.id}
    className={`overflow-hidden transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg ${gradientClass || ''}`}
  >
    <div className="flex flex-col md:flex-row">
      <div className="flex-1 p-6">
        <div className="mb-2 flex flex-wrap gap-2">
          {amendment.code && (
            <Badge variant="secondary">
              {amendment.code}
            </Badge>
          )}
          {amendment.collaborationRole && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {amendment.collaborationRole}
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold">{amendment.title}</h3>
        {amendment.subtitle && (
          <p className="mb-2 text-sm text-muted-foreground">{amendment.subtitle}</p>
        )}
        <div className="mt-2 space-y-1">
          <p className="text-sm text-muted-foreground">
            {amendment.supporters} supporters • {amendment.date}
          </p>
          {(amendment.collaboratorsCount !== undefined ||
            amendment.supportingGroupsCount !== undefined ||
            amendment.supportingMembersCount !== undefined) && (
            <p className="text-sm text-muted-foreground">
              {amendment.collaboratorsCount !== undefined &&
                `${amendment.collaboratorsCount} collaborators`}
              {amendment.supportingGroupsCount !== undefined &&
                ` • ${amendment.supportingGroupsCount} supporting groups`}
              {amendment.supportingMembersCount !== undefined &&
                ` • ${amendment.supportingMembersCount} supporting members`}
            </p>
          )}
        </div>
        {amendment.tags && amendment.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {amendment.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-center border-l p-6">
        <Badge variant={statusStyle.badge as any} className={statusStyle.badgeTextColor || ''}>
          {amendment.status}
        </Badge>
      </div>
    </div>
  </Card>
);
