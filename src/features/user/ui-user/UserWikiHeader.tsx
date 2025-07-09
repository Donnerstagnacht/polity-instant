import React from 'react';
import { WikiAvatar } from './WikiAvatar';
import { WikiFollowButton } from './WikiFollowButton';

interface UserWikiHeaderProps {
  name: string;
  avatar: string;
  subtitle: string;
  following: boolean;
  onFollowClick: () => void;
}

export const UserWikiHeader: React.FC<UserWikiHeaderProps> = ({
  name,
  avatar,
  subtitle,
  following,
  onFollowClick,
}) => (
  <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
    <WikiAvatar name={name} avatar={avatar} className="h-24 w-24 md:h-32 md:w-32" />
    <div className="flex-1 text-center md:text-left">
      <h1 className="text-2xl font-bold md:text-4xl">{name}</h1>
      <p className="text-muted-foreground mt-1">{subtitle}</p>
    </div>
    <WikiFollowButton following={following} onClick={onFollowClick} className="mt-2 md:mt-0" />
  </div>
);
