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
}

export const AmendmentsCard: React.FC<AmendmentsCardProps> = ({ amendment, statusStyle }) => (
  <Card
    key={amendment.id}
    className="overflow-hidden transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg"
  >
    <div className="flex flex-col md:flex-row">
      <div className={`flex-1 p-6 ${statusStyle.bgColor}`}>
        {amendment.code && (
          <Badge variant="secondary" className="mb-2">
            {amendment.code}
          </Badge>
        )}
        <h3 className={`text-lg font-semibold ${statusStyle.textColor}`}>{amendment.title}</h3>
        {amendment.subtitle && (
          <p className="text-muted-foreground mb-2 text-sm">{amendment.subtitle}</p>
        )}
        <p className="text-muted-foreground mt-1 text-sm">
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
      <div className={`flex items-center justify-center p-6 ${statusStyle.bgColor} border-l`}>
        <Badge variant={statusStyle.badge as any} className={statusStyle.badgeTextColor || ''}>
          {amendment.status}
        </Badge>
      </div>
    </div>
  </Card>
);
