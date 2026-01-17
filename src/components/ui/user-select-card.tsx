'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon } from 'lucide-react';

interface UserSelectCardProps {
  user: {
    id: string;
    name?: string;
    avatar?: string;
    handle?: string;
    bio?: string;
    contactEmail?: string;
  };
}

export function UserSelectCard({ user }: UserSelectCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {user.avatar ? <AvatarImage src={user.avatar} alt={user.name || ''} /> : null}
            <AvatarFallback>{user.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{user.name || 'Unnamed User'}</CardTitle>
              <Badge variant="outline" className="flex-shrink-0">
                <UserIcon className="mr-1 h-3 w-3" />
                User
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {user.handle ? `@${user.handle}` : user.contactEmail}
            </div>
          </div>
        </div>
      </CardHeader>
      {user.bio && (
        <CardContent className="pt-0">
          <p className="line-clamp-2 text-xs text-muted-foreground">{user.bio}</p>
        </CardContent>
      )}
    </Card>
  );
}
