import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Users } from 'lucide-react';
import { GRADIENTS } from '@/features/users/state/gradientColors';

import { type SearchUser } from '../types/search.types';

interface UserSearchCardProps {
  user: SearchUser;
  index?: number;
}

export function UserSearchCard({ user, index }: UserSearchCardProps) {
  // User ID is now directly on the $users entity
  const userId = user.id;

  // Get avatar from possible sources
  const avatar = user.avatar || '';

  // Build display name from first_name + last_name
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.handle || 'Unknown User';

  // Get gradient class for this user card
  const gradientClass = GRADIENTS[(index || 0) % GRADIENTS.length];

  return (
    <a href={`/user/${userId}`} className="block">
      <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
        {/* Gradient Header */}
        <div className={`relative h-24 ${gradientClass}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
        </div>

        <CardHeader className="pb-3 pt-4">
          <div className="mb-3 flex items-start gap-3">
            {/* Avatar next to name */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-background shadow-md">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name and handle */}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight">{displayName}</CardTitle>
              {user.handle && <CardDescription className="mt-0.5">@{user.handle}</CardDescription>}
            </div>

            {/* Badge */}
            <Badge variant="secondary" className="flex-shrink-0 text-xs">
              <Users className="mr-1 h-3 w-3" />
              User
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {user.bio && <p className="line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>}
          {user.location && (
            <p className="mt-2 text-xs text-muted-foreground">{user.location}</p>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
