import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface WikiAvatarProps {
  name: string;
  avatar: string;
  className?: string;
}

/**
 * Dumb avatar component for the user wiki profile.
 * Shows the user's avatar image, or initials fallback.
 */
export const WikiAvatar: React.FC<WikiAvatarProps> = ({ name, avatar, className }) => (
  <Avatar className={className}>
    <AvatarImage src={avatar} alt={name} />
    <AvatarFallback>
      {name
        .split(' ')
        .map(n => n[0])
        .join('')}
    </AvatarFallback>
  </Avatar>
);
