import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatementCardProps {
  tag: string;
  text: string;
  tagColor: { bg: string; text: string };
}

export const StatementCard: React.FC<StatementCardProps> = ({ tag, text, tagColor }) => (
  <Card className="h-full">
    <CardHeader className="pb-2">
      <Badge className={`${tagColor.bg} ${tagColor.text} hover:${tagColor.bg}`}>{tag}</Badge>
    </CardHeader>
    <CardContent>
      <p className="text-lg italic">"{text}"</p>
    </CardContent>
  </Card>
);
