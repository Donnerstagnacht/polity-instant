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
        {amendment.code && (
          <Badge variant="secondary" className="mb-2">
            {amendment.code}
          </Badge>
        )}
        <h3 className="text-lg font-semibold">{amendment.title}</h3>
        {amendment.subtitle && (
          <p className="mb-2 text-sm text-muted-foreground">{amendment.subtitle}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {amendment.supporters} supporters • {amendment.date}
        </p>
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
